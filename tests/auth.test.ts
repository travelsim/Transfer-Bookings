import test from "node:test";
import assert from "node:assert/strict";

import { requireAdminToken } from "../server/auth";

/**
 * Minimal Express-compatible doubles. `requireAdminToken` only reads
 * `req.headers`, writes a status/body and optionally calls `next`, so this is
 * enough to exercise the guard without pulling in an HTTP test dependency.
 */
function invoke(token: string | undefined, supplied?: string) {
  const originalToken = process.env.ADMIN_API_TOKEN;
  if (token === undefined) delete process.env.ADMIN_API_TOKEN;
  else process.env.ADMIN_API_TOKEN = token;

  const req: any = { headers: supplied ? { authorization: supplied } : {} };
  let status = 0;
  let body: any = null;
  let nextCalled = false;
  const res: any = {
    status(code: number) {
      status = code;
      return res;
    },
    json(payload: any) {
      body = payload;
      return res;
    },
  };

  requireAdminToken(req, res, () => {
    nextCalled = true;
  });

  if (originalToken === undefined) delete process.env.ADMIN_API_TOKEN;
  else process.env.ADMIN_API_TOKEN = originalToken;

  return { status, body, nextCalled };
}

test("admin endpoint is closed, not open, when no token is configured", () => {
  const { status, nextCalled } = invoke(undefined);
  // The dangerous failure mode is treating "no token set" as "no auth needed".
  assert.equal(nextCalled, false);
  assert.equal(status, 503);
});

test("admin endpoint rejects a missing token", () => {
  const { status, nextCalled } = invoke("expected-token");
  assert.equal(nextCalled, false);
  assert.equal(status, 401);
});

test("admin endpoint rejects a wrong token", () => {
  const { status, nextCalled } = invoke("expected-token", "Bearer wrong-token");
  assert.equal(nextCalled, false);
  assert.equal(status, 401);
});

test("admin endpoint rejects a token that merely starts the same", () => {
  const { status, nextCalled } = invoke(
    "expected-token",
    "Bearer expected-token-plus-more",
  );
  assert.equal(nextCalled, false);
  assert.equal(status, 401);
});

test("admin endpoint accepts the correct bearer token", () => {
  const { status, nextCalled } = invoke("expected-token", "Bearer expected-token");
  assert.equal(nextCalled, true);
  assert.equal(status, 0);
});

test("admin endpoint ignores a token sent without the bearer prefix", () => {
  const { status, nextCalled } = invoke("expected-token", "expected-token");
  assert.equal(nextCalled, false);
  assert.equal(status, 401);
});