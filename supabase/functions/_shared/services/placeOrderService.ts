/**
 * Place order (blueprint flow) — request validation.
 * Persistence via public.place_order RPC.
 */

import type { PlaceOrderRequest } from "./types.ts";

export function validatePlaceOrderRequest(body: unknown): body is PlaceOrderRequest {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (!o.shipping_address || typeof o.shipping_address !== "object") return false;
  if (o.payment_method !== undefined && typeof o.payment_method !== "string") return false;
  if (o.gift_option !== undefined && o.gift_option !== null && typeof o.gift_option !== "object") return false;
  if (o.discount_type !== undefined) {
    if (o.discount_type !== "none" && o.discount_type !== "bulk" && o.discount_type !== "combo") return false;
  }
  if (o.discount_amount !== undefined && (typeof o.discount_amount !== "number" || o.discount_amount < 0)) return false;
  if (o.shipping_amount !== undefined && (typeof o.shipping_amount !== "number" || o.shipping_amount < 0)) return false;
  return true;
}

export function normalizePlaceOrderPayload(body: PlaceOrderRequest): {
  shipping_address: Record<string, unknown>;
  discount_type: "none" | "bulk" | "combo";
  discount_amount: number;
  shipping_amount: number;
} {
  return {
    shipping_address: body.shipping_address as Record<string, unknown>,
    discount_type: body.discount_type === "bulk" || body.discount_type === "combo" ? body.discount_type : "none",
    discount_amount: typeof body.discount_amount === "number" && body.discount_amount >= 0 ? body.discount_amount : 0,
    shipping_amount: typeof body.shipping_amount === "number" && body.shipping_amount >= 0 ? body.shipping_amount : 0,
  };
}
