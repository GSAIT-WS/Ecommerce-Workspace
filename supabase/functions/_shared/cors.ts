/**
 * CORS headers for Supabase Edge Functions.
 *
 * CORS_ORIGIN env var can restrict origins in production (e.g. "https://yourapp.com").
 * Falls back to "*" so local development always works without extra config.
 */
const allowedOrigin =
  (typeof Deno !== "undefined" ? Deno.env.get("CORS_ORIGIN") : undefined) ?? "*";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, x-webhook-signature, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

/**
 * Returns a 200 preflight response with CORS headers.
 * Uses "ok" body (not null) — required by some proxies and strict browser
 * implementations to treat the preflight as successful.
 */
export function preflightResponse(): Response {
  return new Response("ok", { status: 200, headers: corsHeaders });
}
