/**
 * Product service layer — validation only (no Supabase).
 */

import type { ListProductsParams, GetProductByIdParams } from "./types.ts";
import { isValidUuid } from "../validation.ts";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function validateListProductsParams(body: unknown): {
  valid: true;
  params: ListProductsParams & { limit: number; offset: number };
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (o.category_id !== undefined && o.category_id !== null) {
    if (!isValidUuid(o.category_id)) {
      return { valid: false, error: "category_id must be a valid UUID" };
    }
  }
  if (o.category_slug !== undefined && o.category_slug !== null) {
    if (typeof o.category_slug !== "string" || o.category_slug.trim() === "") {
      return { valid: false, error: "category_slug must be a non-empty string" };
    }
  }
  if (o.search !== undefined && o.search !== null) {
    if (typeof o.search !== "string") {
      return { valid: false, error: "search must be a string" };
    }
  }
  if (o.min_price !== undefined && o.min_price !== null) {
    if (typeof o.min_price !== "number" || o.min_price < 0 || !Number.isFinite(o.min_price)) {
      return { valid: false, error: "min_price must be a non-negative number" };
    }
  }
  if (o.max_price !== undefined && o.max_price !== null) {
    if (typeof o.max_price !== "number" || o.max_price < 0 || !Number.isFinite(o.max_price)) {
      return { valid: false, error: "max_price must be a non-negative number" };
    }
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
  const params: ListProductsParams & { limit: number; offset: number } = {
    limit,
    offset,
  };
  if (o.category_id !== undefined && o.category_id !== null) params.category_id = o.category_id as string;
  if (o.category_slug !== undefined && o.category_slug !== null && String(o.category_slug).trim() !== "") {
    params.category_slug = String(o.category_slug).trim();
  }
  if (o.search !== undefined && o.search !== null && String(o.search).trim() !== "") {
    params.search = String(o.search).trim();
  }
  if (o.min_price !== undefined && o.min_price !== null) params.min_price = o.min_price as number;
  if (o.max_price !== undefined && o.max_price !== null) params.max_price = o.max_price as number;
  return { valid: true, params };
}

export function validateGetProductByIdParams(body: unknown): {
  valid: true;
  params: GetProductByIdParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;
  if (!o.product_id) {
    return { valid: false, error: "product_id is required" };
  }
  if (!isValidUuid(o.product_id)) {
    return { valid: false, error: "product_id must be a valid UUID" };
  }
  return { valid: true, params: { product_id: o.product_id as string } };
}
