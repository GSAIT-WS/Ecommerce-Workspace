/**
 * Direct Postgres client for Edge Functions (native Deno implementation).
 *
 * Uses SUPABASE_DB_URL (auto-injected by Supabase) to bypass PostgREST
 * entirely. This lets us query any schema (e.g. ecommerce) regardless of
 * what schemas are exposed in the PostgREST API settings.
 *
 * Uses deno.land/x/postgres which is the native Deno Postgres driver and
 * is fully compatible with Deno Deploy / Supabase edge function runtime.
 */
import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    throw new Error("SUPABASE_DB_URL is not available in this environment");
  }
  _pool = new Pool(dbUrl, 3, true);
  return _pool;
}

/** Run a callback with a pooled Postgres connection, auto-released on completion. */
export async function withDb<T>(
  fn: (client: Awaited<ReturnType<Pool["connect"]>>) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
