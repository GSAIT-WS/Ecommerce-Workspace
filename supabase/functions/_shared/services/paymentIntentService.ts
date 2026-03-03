/**
 * Create payment intent — validation only (no Supabase).
 * Used by create-payment-intent Edge Function.
 */

import type { CreatePaymentIntentParams } from "./types.ts";
import { isValidUuid } from "../validation.ts";

export function validateCreatePaymentIntentParams(body: unknown): {
  valid: true;
  params: CreatePaymentIntentParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.user_id) {
    return { valid: false, error: "user_id is required" };
  }
  if (!isValidUuid(o.user_id)) {
    return { valid: false, error: "user_id must be a valid UUID" };
  }
  if (!o.order_id) {
    return { valid: false, error: "order_id is required" };
  }
  if (!isValidUuid(o.order_id)) {
    return { valid: false, error: "order_id must be a valid UUID" };
  }
  return {
    valid: true,
    params: { user_id: o.user_id as string, order_id: o.order_id as string },
  };
}
