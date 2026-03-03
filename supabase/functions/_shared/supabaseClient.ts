/**
 * Create Supabase client for use in Edge Functions.
 * Import in Edge Functions only; service layer stays free of Supabase.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
