/**
 * Cart CRUD service layer — validation only (no Supabase).
 */

import type {
  GetCartParams,
  AddToCartParams,
  UpdateCartItemParams,
  RemoveCartItemParams,
  ClearCartParams,
} from "./types.ts";
import { isValidUuid } from "../validation.ts";

export function validateGetCartParams(body: unknown): {
  valid: true;
  params: GetCartParams;
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
  return { valid: true, params: { user_id: o.user_id as string } };
}

function isValidComboCustomization(custom: unknown): custom is { items: { product_id: string; quantity: number }[]; gift_wrap?: boolean; gift_message?: string } {
  if (!custom || typeof custom !== "object") return false;
  const c = custom as Record<string, unknown>;
  if (!Array.isArray(c.items) || c.items.length === 0) return false;
  for (const it of c.items) {
    if (!it || typeof it !== "object") return false;
    const i = it as Record<string, unknown>;
    if (!i.product_id || !isValidUuid(i.product_id)) return false;
    const q = Number(i.quantity);
    if (!Number.isInteger(q) || q < 1) return false;
  }
  return true;
}

export function validateAddToCartParams(body: unknown): {
  valid: true;
  params: AddToCartParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.user_id) return { valid: false, error: "user_id is required" };
  if (!isValidUuid(o.user_id)) return { valid: false, error: "user_id must be a valid UUID" };
  const itemType = (o.item_type as string) || "product";
  if (itemType !== "product" && itemType !== "combo") {
    return { valid: false, error: "item_type must be 'product' or 'combo'" };
  }
  if (o.quantity === undefined || o.quantity === null) {
    return { valid: false, error: "quantity is required" };
  }
  const q = Number(o.quantity);
  if (!Number.isInteger(q) || q < 1) {
    return { valid: false, error: "quantity must be a positive integer" };
  }

  if (itemType === "product") {
    if (!o.product_id) return { valid: false, error: "product_id is required for item_type product" };
    if (!isValidUuid(o.product_id)) return { valid: false, error: "product_id must be a valid UUID" };
    return {
      valid: true,
      params: {
        user_id: o.user_id as string,
        product_id: o.product_id as string,
        quantity: q,
        item_type: "product",
      },
    };
  }

  // Combo: accept either customization: { items, ... } or top-level items + gift_wrap + gift_message
  let customization: AddToCartParams["customization"];
  if (o.customization && isValidComboCustomization(o.customization)) {
    customization = o.customization as AddToCartParams["customization"];
  } else if (Array.isArray(o.items) && o.items.length > 0) {
    const items = o.items as unknown[];
    for (const it of items) {
      if (!it || typeof it !== "object") return { valid: false, error: "combo items must be { product_id, quantity }" };
      const i = it as Record<string, unknown>;
      if (!i.product_id || !isValidUuid(i.product_id)) return { valid: false, error: "each item must have a valid product_id" };
      const qty = Number(i.quantity);
      if (!Number.isInteger(qty) || qty < 1) return { valid: false, error: "each item must have quantity >= 1" };
    }
    customization = {
      items: (o.items as { product_id: string; quantity: number }[]),
      gift_wrap: !!o.gift_wrap,
      ...(o.gift_message != null && { gift_message: String(o.gift_message) }),
    };
  } else {
    return { valid: false, error: "combo requires customization with items, or top-level items array" };
  }
  return {
    valid: true,
    params: {
      user_id: o.user_id as string,
      quantity: q,
      item_type: "combo",
      customization,
    },
  };
}

export function validateUpdateCartItemParams(body: unknown): {
  valid: true;
  params: UpdateCartItemParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.user_id) return { valid: false, error: "user_id is required" };
  if (!isValidUuid(o.user_id)) return { valid: false, error: "user_id must be a valid UUID" };
  const byId = o.cart_item_id != null && isValidUuid(o.cart_item_id as string);
  const byProduct = o.product_id != null && isValidUuid(o.product_id as string);
  if (!byId && !byProduct) {
    return { valid: false, error: "Either cart_item_id or product_id is required" };
  }
  if (o.quantity === undefined || o.quantity === null) {
    return { valid: false, error: "quantity is required" };
  }
  const q = Number(o.quantity);
  if (!Number.isInteger(q) || q < 0) {
    return { valid: false, error: "quantity must be a non-negative integer (0 to remove)" };
  }
  return {
    valid: true,
    params: {
      user_id: o.user_id as string,
      product_id: byProduct ? (o.product_id as string) : undefined,
      cart_item_id: byId ? (o.cart_item_id as string) : undefined,
      quantity: q,
    },
  };
}

export function validateRemoveCartItemParams(body: unknown): {
  valid: true;
  params: RemoveCartItemParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.user_id) return { valid: false, error: "user_id is required" };
  if (!isValidUuid(o.user_id)) return { valid: false, error: "user_id must be a valid UUID" };
  const byId = o.cart_item_id != null && isValidUuid(o.cart_item_id as string);
  const byProduct = o.product_id != null && isValidUuid(o.product_id as string);
  if (!byId && !byProduct) {
    return { valid: false, error: "Either cart_item_id or product_id is required" };
  }
  return {
    valid: true,
    params: {
      user_id: o.user_id as string,
      product_id: byProduct ? (o.product_id as string) : undefined,
      cart_item_id: byId ? (o.cart_item_id as string) : undefined,
    },
  };
}

export function validateClearCartParams(body: unknown): {
  valid: true;
  params: ClearCartParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.user_id) return { valid: false, error: "user_id is required" };
  if (!isValidUuid(o.user_id)) return { valid: false, error: "user_id must be a valid UUID" };
  return { valid: true, params: { user_id: o.user_id as string } };
}
