import type { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Small in-process fixed-window limiter for the public enquiry endpoint.
 *
 * Scope note: state is per-process. On an autoscale deployment N instances
 * allow roughly N times the configured rate. That is still far better than
 * nothing against scripted form spam, but it is not a hard global limit --
 * move this to a shared store (Redis or the database) if abuse becomes real.
 */
const buckets = new Map<string, Bucket>();

// Bound memory: stale entries are swept on each call.
function sweep(now: number) {
  if (buckets.size < 5_000) return;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
  keyFn?: (req: Request) => string;
}) {
  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    sweep(now);

    const key = opts.keyFn
      ? opts.keyFn(req)
      : req.ip || req.socket.remoteAddress || "unknown";
    const bucketKey = `${key}`;

    let bucket = buckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(bucketKey, bucket);
    }

    bucket.count += 1;

    res.setHeader("X-RateLimit-Limit", String(opts.max));
    res.setHeader(
      "X-RateLimit-Remaining",
      String(Math.max(0, opts.max - bucket.count)),
    );

    if (bucket.count > opts.max) {
      res.setHeader("Retry-After", String(Math.ceil(opts.windowMs / 1000)));
      return res.status(429).json({
        message: "Too many enquiries submitted. Please try again shortly.",
      });
    }

    return next();
  };
}