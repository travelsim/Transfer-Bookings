import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Lazily-created connection pool.
 *
 * The pool is created on first use rather than at import time so that unit
 * tests and `tsc` can import modules that reference `db` without a live
 * database, and so a missing DATABASE_URL surfaces as a startup error with a
 * useful message instead of a stack trace from module evaluation.
 */
let pool: Pool | undefined;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Booking enquiries cannot be stored durably. " +
        "Set DATABASE_URL before starting the server; see .env.example.",
    );
  }

  pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX || 5),
    // Fail fast rather than hanging a request when the database is down.
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  // An idle client erroring out must not take the process down; the pool
  // discards the client and the next query opens a fresh connection.
  pool.on("error", (err) => {
    console.error("Unexpected error on idle database client:", err.message);
  });

  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema: undefined });
}

export async function checkDatabase(): Promise<boolean> {
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}