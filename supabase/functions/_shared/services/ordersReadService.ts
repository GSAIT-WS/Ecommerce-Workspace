/**
 * Orders read & cancel — validation only (no Supabase).
 * Used by list-my-orders, get-order-by-id, cancel-order Edge Functions.
 */

import type {
  ListMyOrdersParams,
  GetOrderByIdParams,
  CancelOrderParams,
} from "./types.ts";
import { isValidUuid } from "../validation.ts";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function validateListMyOrdersParams(body: unknown): {
  valid: true;
  params: ListMyOrdersParams;
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
  let limit = DEFAULT_LIMIT;
  if (o.limit !== undefined && o.limit !== null) {
    const n = Number(o.limit);
    if (!Number.isInteger(n) || n < 1 || n > MAX_LIMIT) {
      return { valid: false, error: `limit must be an integer between 1 and ${MAX_LIMIT}` };
    }
    limit = n;
  }
  let offset = 0;
  if (o.offset !== undefined && o.offset !== null) {
    const n = Number(o.offset);
    if (!Number.isInteger(n) || n < 0) {
      return { valid: false, error: "offset must be a non-negative integer" };
    }
    offset = n;
  }
  return {
    valid: true,
    params: { user_id: o.user_id as string, limit, offset },
  };
}

export function validateGetOrderByIdParams(body: unknown): {
  valid: true;
  params: GetOrderByIdParams;
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

export function validateCancelOrderParams(body: unknown): {
  valid: true;
  params: CancelOrderParams;
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

/** Statuses that allow cancellation */
const CANCELLABLE_ORDER_STATUSES = ["pending", "confirmed"] as const;
