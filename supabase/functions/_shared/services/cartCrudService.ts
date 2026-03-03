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
  if (!o.product_id) return { valid: false, error: "product_id is required" };
  if (!isValidUuid(o.product_id)) return { valid: false, error: "product_id must be a valid UUID" };
  if (o.quantity === undefined || o.quantity === null) {
    return { valid: false, error: "quantity is required" };
  }
  const q = Number(o.quantity);
  if (!Number.isInteger(q) || q < 1) {
    return { valid: false, error: "quantity must be a positive integer" };
  }
  return {
    valid: true,
    params: {
      user_id: o.user_id as string,
      product_id: o.product_id as string,
      quantity: q,
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
  if (!o.product_id) return { valid: false, error: "product_id is required" };
  if (!isValidUuid(o.product_id)) return { valid: false, error: "product_id must be a valid UUID" };
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
      product_id: o.product_id as string,
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
  if (!o.product_id) return { valid: false, error: "product_id is required" };
  if (!isValidUuid(o.product_id)) return { valid: false, error: "product_id must be a valid UUID" };
  return {
    valid: true,
    params: { user_id: o.user_id as string, product_id: o.product_id as string },
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
