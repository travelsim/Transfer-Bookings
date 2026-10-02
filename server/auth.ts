import { timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison. A plain `===` on a shared secret leaks its
 * value one byte at a time through response timing.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // timingSafeEqual throws on length mismatch; burn a comparison anyway so
    // the failure path costs roughly the same as the success path.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Bearer-token guard for endpoints that return customer personal data.
 *
 * Returns 503 rather than 401 when the server has no token configured. An
 * unset token must not be treated as "no auth required" -- that is how a
 * public enquiry dump happens.
 */
export function requireAdminToken(req: any, res: any, next: () => void): void {
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    return res.status(503).json({
      message:
        "Administrative API is disabled because ADMIN_API_TOKEN is not configured",
    });
  }

  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const supplied = match ? match[1].trim() : "";

  if (!supplied || !safeEqual(supplied, expected)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
}