/**
 * Order business logic (service layer).
 * No Supabase/HTTP here — import this from Edge Functions and pass data in.
 */

import type { OrderInput, OrderTotals } from "./types.ts";

const MIN_ORDER_AMOUNT = 0;
const MAX_ORDER_ITEMS = 50;

export function validateOrderInput(input: unknown): input is OrderInput {
  if (!input || typeof input !== "object") return false;
  const o = input as Record<string, unknown>;
  if (!Array.isArray(o.items) || o.items.length === 0) return false;
  for (const item of o.items as unknown[]) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as Record<string, unknown>).product_id !== "string" ||
      typeof (item as Record<string, unknown>).quantity !== "number" ||
      (item as Record<string, unknown>).quantity < 1 ||
      typeof (item as Record<string, unknown>).unit_price !== "number" ||
      (item as Record<string, unknown>).unit_price < 0
    )
      return false;
  }
  const totalItems = (o.items as unknown[]).reduce(
    (sum, i) => sum + ((i as Record<string, unknown>).quantity as number),
    0
  );
  if (totalItems > MAX_ORDER_ITEMS) return false;
  return true;
}

export function calculateOrderTotals(input: OrderInput): OrderTotals {
  const subtotal = input.items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  );
  const deliveryCharge = Math.max(0, input.delivery_charge ?? 0);
  const discount = Math.max(0, Math.min(subtotal, input.discount_amount ?? 0));
  const total = Math.max(
    MIN_ORDER_AMOUNT,
    subtotal + deliveryCharge - discount
  );
  return {
    subtotal,
    deliveryCharge,
    discount,
    total,
  };
}
