/**
 * Shared authentication helpers for Edge Functions.
 *
 * - authenticateRequest: resolves user_id from JWT only (secure).
 * - verifyWebhookSignature: HMAC-SHA256 signature check for webhook endpoints.
 */

import { createSupabaseClient } from "./supabaseClient.ts";

interface AuthSuccess {
  authenticated: true;
  user_id: string;
}

interface AuthError {
  authenticated: false;
  error: string;
  status: number;
}

export type AuthResult = AuthSuccess | AuthError;

/**
 * Authenticate the request and resolve user_id via JWT only.
 *
 * If JWT is present but invalid → 401.
 * If JWT user_id conflicts with bodyUserId → 403.
 * If no JWT → 401.
 */
export async function authenticateRequest(
  req: Request,
  bodyUserId?: string | null,
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "Authorization required", status: 401 };
  }

  const token = authHeader.slice(7);
  if (!token) {
    return { authenticated: false, error: "Empty bearer token", status: 401 };
  }

  try {
    const supabase = createSupabaseClient(req);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user?.id) {
      return {
        authenticated: false,
        error: "Invalid or expired token",
        status: 401,
      };
    }

    if (bodyUserId && bodyUserId !== user.id) {
      return {
        authenticated: false,
        error: "user_id does not match authenticated user",
        status: 403,
      };
    }

    return { authenticated: true, user_id: user.id };
  } catch {
    return {
      authenticated: false,
      error: "Authentication failed",
      status: 401,
    };
  }
}

/**
 * Verify webhook signature using HMAC-SHA256.
 * If WEBHOOK_SECRET env var is not set, verification is skipped (dev mode).
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ valid: boolean; error?: string }> {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret) {
    return { valid: true };
  }

  if (!signatureHeader) {
    return { valid: false, error: "Missing X-Webhook-Signature header" };
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signatureHeader !== expectedSig) {
    return { valid: false, error: "Invalid webhook signature" };
  }

  return { valid: true };
}
