/**
 * CORS headers for Supabase Edge Functions.
 *
 * Allowed origins include the production storefront (https://www.purvita.in)
 * and local development origins. Update ALLOWED_ORIGINS when adding new
 * environments.
 */
const ALLOWED_ORIGINS: readonly string[] = [
  "https://www.purvita.in",
  "http://localhost:5173",
  "http://localhost:8080",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

export function getCorsDynamicHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, x-webhook-signature, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

export const corsHeaders: Record<string, string> = {
  ...getCorsDynamicHeaders(null),
};

/**
 * Returns a 200 preflight response with CORS headers.
 * Uses "ok" body (not null) — required by some proxies and strict browser
 * implementations to treat the preflight as successful.
 */
export function preflightResponse(origin: string | null = null): Response {
  return new Response("ok", { status: 200, headers: getCorsDynamicHeaders(origin) });
}
