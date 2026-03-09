/**
 * Online order creation (service layer).
 * Validates request payload; persistence is done via ecommerce.create_online_order RPC.
 */

import type { CreateOnlineOrderRequest } from "./types.ts";
import { isValidUuid } from "../validation.ts";

export function validateCreateOrderRequest(
  body: unknown
): body is CreateOnlineOrderRequest {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (!isValidUuid(o.customer_id)) return false;
  if (!isValidUuid(o.cart_id)) return false;
  if (o.coupon_code !== undefined && o.coupon_code !== null) {
    if (typeof o.coupon_code !== "string") return false;
  }
  if (o.shipping_amount !== undefined && o.shipping_amount !== null) {
    if (typeof o.shipping_amount !== "number" || o.shipping_amount < 0)
      return false;
  }
  if (o.shipping_address !== undefined && o.shipping_address !== null) {
    if (typeof o.shipping_address !== "object") return false;
  }
  return true;
}

/** Normalize request for RPC: ensure numbers and nulls. */
export function normalizeCreateOrderPayload(
  body: CreateOnlineOrderRequest
): {
  customer_id: string;
  cart_id: string;
  coupon_code: string | null;
  shipping_amount: number;
  shipping_address: Record<string, unknown> | null;
} {
  return {
    customer_id: body.customer_id,
    cart_id: body.cart_id,
    coupon_code:
      body.coupon_code != null && String(body.coupon_code).trim() !== ""
        ? String(body.coupon_code).trim()
        : null,
    shipping_amount:
      typeof body.shipping_amount === "number" && body.shipping_amount >= 0
        ? body.shipping_amount
        : 0,
    shipping_address:
      body.shipping_address != null && typeof body.shipping_address === "object"
        ? body.shipping_address
        : null,
  };
}
