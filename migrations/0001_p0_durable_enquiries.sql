-- P0: durable, queryable enquiry storage.
--
-- Idempotent by design: every statement is IF NOT EXISTS, so this can be run
-- against a fresh or an already-migrated database without failing.
--
-- Apply with: psql "$DATABASE_URL" -f migrations/0001_p0_durable_enquiries.sql
-- or via `npm run db:push`, which derives the same shape from shared/schema.ts.

-- Return-trip date and time. Previously a return trip could be booked with no
-- return date at all, which left the operator unable to quote it.
ALTER TABLE booking_enquiries ADD COLUMN IF NOT EXISTS return_date text;
ALTER TABLE booking_enquiries ADD COLUMN IF NOT EXISTS return_time text;

-- Honeypot column. Intentionally never written to by the route: a submission
-- carrying a value is dropped silently.
ALTER TABLE booking_enquiries ADD COLUMN IF NOT EXISTS website text;

-- Enquiry lifecycle state, so an operator can work a queue rather than re-read
-- every enquiry on each visit. Server-owned; never accepted from the client.
ALTER TABLE booking_enquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Receipt time. Replaces reliance on insertion order in an unindexed table and
-- makes response-time reporting possible.
ALTER TABLE booking_enquiries ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Existing rows predate created_at; backfill rather than leave them at the
-- epoch default so ordering and SLA reporting stay meaningful.
UPDATE booking_enquiries SET created_at = now() WHERE created_at IS NULL;

-- The admin listing orders by created_at, newest first.
CREATE INDEX IF NOT EXISTS booking_enquiries_created_at_idx
  ON booking_enquiries (created_at DESC);

-- Supports filtering the operator queue by state.
CREATE INDEX IF NOT EXISTS booking_enquiries_status_idx
  ON booking_enquiries (status);