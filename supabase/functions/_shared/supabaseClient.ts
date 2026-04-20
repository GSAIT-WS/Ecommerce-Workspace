/**
 * Create Supabase client for use in Edge Functions.
 * Import in Edge Functions only; service layer stays free of Supabase.
 */
// Pin a recent 2.x — bare `@2` on esm.sh can resolve to an old release that throws
// "Unsupported JWT algorithm ES256" when calling `auth.getUser()` (asymmetric JWTs).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

export function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    }
  );
}

export function createSupabaseServiceRoleClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}
