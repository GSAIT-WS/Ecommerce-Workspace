/**
 * Cart business logic (service layer).
 * No Supabase/HTTP here — import this from Edge Functions and pass data in.
 */

import type { CartItemInput, CartTotals } from "./types.ts";

const MAX_CART_ITEMS = 100;

export function validateCartItems(items: unknown): items is CartItemInput[] {
  if (!Array.isArray(items)) return false;
  for (const item of items) {
    const o = item as Record<string, unknown>;
    if (!item || typeof item !== "object") return false;
    if (typeof o.quantity !== "number" || o.quantity < 1) return false;
    if (typeof o.unit_price !== "number" || o.unit_price < 0) return false;
    // product items have product_id; combo items have item_type and optionally customization_json
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
