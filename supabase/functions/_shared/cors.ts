/**
 * CORS headers for Supabase Edge Functions.
 *
 * Set CORS_ORIGIN env var to restrict allowed origins in production.
 * Defaults to "*" (all origins) when not set.
 */
const allowedOrigin =
  (typeof Deno !== "undefined" ? Deno.env.get("CORS_ORIGIN") : undefined) ?? "*";

export const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, x-webhook-signature, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};
