/**
 * Payment webhook — validation only (no Supabase).
 * Used by payment-webhook Edge Function.
 */

import type { PaymentWebhookParams } from "./types.ts";

export function validatePaymentWebhookParams(body: unknown): {
  valid: true;
  params: PaymentWebhookParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.external_id || typeof o.external_id !== "string" || !o.external_id.trim()) {
    return { valid: false, error: "external_id is required and must be a non-empty string" };
  }
  if (o.outcome !== "succeeded" && o.outcome !== "failed") {
    return { valid: false, error: "outcome must be 'succeeded' or 'failed'" };
  }
  return {
    valid: true,
    params: {
      external_id: (o.external_id as string).trim(),
      outcome: o.outcome as "succeeded" | "failed",
    },
  };
}
