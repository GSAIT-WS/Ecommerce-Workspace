/**
 * Cart business logic (service layer).
 * No Supabase/HTTP here — import this from Edge Functions and pass data in.
 */

import type { CartItemInput, CartTotals } from "./types.ts";

const MAX_CART_ITEMS = 100;

export function validateCartItems(items: unknown): items is CartItemInput[] {
  if (!Array.isArray(items)) return false;
  for (const item of items) {
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
  const totalQty = items.reduce(
    (sum, i) => sum + ((i as CartItemInput).quantity ?? 0),
    0
  );
  return totalQty <= MAX_CART_ITEMS;
}

export function calculateCartTotals(items: CartItemInput[]): CartTotals {
  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, itemCount };
}
