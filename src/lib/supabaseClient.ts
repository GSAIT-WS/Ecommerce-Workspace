import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

// Valid-looking placeholders so the client loads in dev without .env; replace via .env for real auth/API.
const supabaseUrl =
  envUrl ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  envKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIn0.placeholder";

if (!envUrl || !envKey) {
  console.warn(
    "Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Copy .env.example to .env for real auth and APIs."
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
