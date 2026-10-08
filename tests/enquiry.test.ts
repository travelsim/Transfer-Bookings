import test from "node:test";
import assert from "node:assert/strict";

import { insertBookingEnquirySchema } from "@shared/schema";
import { describeResponseBody, redactUnknown } from "../server/redact";
import { safeEqual } from "../server/auth";

const validEnquiry = {
  whereTo: "Mount Buller",
  whereFrom: "Melbourne CBD",
  pickupDate: "2026-08-01",
  returnTrip: false,
  numAdults: 2,
  numChildren: 0,
  firstName: "Sam",
  lastName: "Rivera",
  email: "sam@example.com",
};

test("accepts a straightforward one-way enquiry", () => {
  const result = insertBookingEnquirySchema.safeParse(validEnquiry);
  assert.equal(result.success, true);
});

test("rejects a return trip with no return date", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    returnTrip: true,
  });
  assert.equal(result.success, false);
});

test("rejects a return date earlier than the pick up date", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    returnTrip: true,
    returnDate: "2026-07-01",
    returnTime: "09:00",
  });
  assert.equal(result.success, false);
});

test("accepts a return trip with a later return date", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    returnTrip: true,
    returnDate: "2026-08-03",
    returnTime: "09:00",
  });
  assert.equal(result.success, true);
});

test("a client cannot set enquiry status", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    status: "confirmed",
  });
  // `status` is omitted from the insert schema, so an unknown key is dropped
  // rather than accepted as writable state.
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal((result.data as Record<string, unknown>).status, undefined);
  }
});

test("honeypot value passes validation so bots cannot detect the trap", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    website: "http://spam.example",
  });
  assert.equal(result.success, true);
});

test("log description never restates an enquiry body", () => {
  const described = describeResponseBody({
    firstName: "Sam",
    lastName: "Rivera",
    email: "sam@example.com",
    phone: "0400 000 000",
  });
  assert.ok(!described.includes("sam@example.com"));
  assert.ok(!described.includes("Rivera"));
  assert.ok(!described.includes("0400 000 000"));
});

test("enquiry list is logged as a count, not contents", () => {
  const described = describeResponseBody({
    enquiries: [{ email: "sam@example.com" }],
  });
  assert.equal(described, "{enquiries: array(1)}");
});

test("redaction masks sensitive keys at any depth", () => {
  const redacted = redactUnknown({
    email: "sam@example.com",
    nested: { phone: "0400 000 000", keep: "visible" },
    list: [{ firstName: "Sam" }],
  });
  const serialised = JSON.stringify(redacted);
  assert.ok(!serialised.includes("sam@example.com"));
  assert.ok(!serialised.includes("0400 000 000"));
  assert.ok(!serialised.includes("Sam"));
  assert.ok(serialised.includes("visible"));
});

test("rejects an unparseable return date instead of passing it through", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    returnTrip: true,
    returnDate: "not-a-date",
  });
  assert.equal(result.success, false);
});

test("accepts a same-day return trip", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    returnTrip: true,
    returnDate: "2026-08-01",
  });
  assert.equal(result.success, true);
});

test("rejects an invalid return time", () => {
  const result = insertBookingEnquirySchema.safeParse({
    ...validEnquiry,
    returnTrip: true,
    returnDate: "2026-08-03",
    returnTime: "25:99",
  });
  assert.equal(result.success, false);
});

test("token comparison rejects a wrong token and accepts the right one", () => {
  assert.equal(safeEqual("correct-token", "correct-token"), true);
  assert.equal(safeEqual("correct-token", "wrong-token"), false);
  assert.equal(safeEqual("correct-token", "correct-token-extra"), false);
  assert.equal(safeEqual("", ""), true);
});