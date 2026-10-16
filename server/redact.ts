/**
 * Redaction for the API request logger.
 *
 * The original logger appended the full JSON body of every /api response to
 * stdout. On the enquiry endpoint that meant every customer's name, email,
 * phone number and free-text notes ended up in platform logs, which are
 * typically retained, searchable and broadly readable.
 *
 * Policy: log the method, path, status and duration. Never the body. If a body
 * summary is ever genuinely needed, it must be added here explicitly, field by
 * field, so it cannot leak by default.
 */

const SENSITIVE_KEYS = new Set([
  "email",
  "phone",
  "firstname",
  "lastname",
  "name",
  "address",
  "returnaddress",
  "additionalinfo",
  "notes",
  "website",
  "authorization",
  "cookie",
  "token",
  "password",
]);

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return "[redacted]";
  if (Array.isArray(value)) return value.map((v) => redactUnknown(v));
  if (value && typeof value === "object") return redactUnknown(value as Record<string, unknown>);
  return value;
}

export function redactUnknown(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

/**
 * Returns a short, non-identifying description of an API response body.
 * Unrecognised payloads are described rather than reproduced.
 */
export function describeResponseBody(body: unknown): string {
  if (body === null || body === undefined) return "";

  if (typeof body === "string") return `string(${body.length})`;
  if (typeof body !== "object") return typeof body;
  if (Array.isArray(body)) return `array(${body.length})`;

  const keys = Object.keys(body as Record<string, unknown>);
  if (keys.length === 0) return "object(0)";

  // Known-safe shape: a plain success message.
  if (keys.length === 1 && keys[0] === "message") {
    return `{message: string}`;
  }

  // A list of enquiries. Report the count, never the contents.
  if (keys.length === 1 && keys[0] === "enquiries") {
    const rows = (body as { enquiries: unknown }).enquiries;
    return `{enquiries: array(${Array.isArray(rows) ? rows.length : 0})}`;
  }

  return `{fields: ${keys.sort().join(",")}}`;
}