/**
 * CORS headers for Supabase Edge Functions.
 *
 * Always uses "*" so every origin (including localhost:8080) is allowed.
 * To lock down to specific origins in production, handle origin matching
 * per-request via getCorsDynamicHeaders() below.
 */
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, x-webhook-signature, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, PUT, PATCH, DELETE, OPTIONS",
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
