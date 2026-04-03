/**
 * Cart API — Supabase Edge Functions for authenticated carts.
 * CartContext calls these when a session exists; guests stay on localStorage only.
 */

import { apiCall, unwrapEdgeData } from "@/lib/api";

export interface AddToCartParams {
  /** Required when `item_type` is `"product"` (default). */
  product_id?: string;
  quantity: number;
  item_type?: "product" | "combo";
  customization?: {
    items: { product_id: string; quantity: number }[];
    gift_wrap?: boolean;
    gift_message?: string;
  };
}

export interface ServerCartProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  tags?: unknown;
}

export interface ServerCartCombo {
  id: string;
  name: string;
  combo_price: number;
  image_url?: string | null;
}

/** One row from get-cart `items` array */
export interface ServerCartLine {
  id: string;
  item_type: string;
  product_id?: string | null;
  combo_id?: string | null;
  quantity: number;
  unit_price?: number | null;
  customization_json?: {
    items: { product_id: string; quantity: number }[];
    gift_wrap?: boolean;
    gift_message?: string;
  } | null;
  product?: ServerCartProduct | null;
  combo?: ServerCartCombo | null;
}

export async function addToCartApi(
  params: AddToCartParams,
  token?: string | null,
): Promise<{ success?: boolean; error?: string }> {
  const itemType = params.item_type ?? "product";
  const body =
    itemType === "combo"
      ? {
          quantity: params.quantity,
          item_type: "combo" as const,
          customization: params.customization!,
        }
      : {
          product_id: params.product_id,
          quantity: params.quantity,
          item_type: "product" as const,
        };

  const result = await apiCall<unknown>("/add-to-cart", {
    method: "POST",
    body,
    token,
  });
  if (result.error) return { error: result.error };
  const u = unwrapEdgeData<Record<string, unknown>>(result.data);
  if (!u.ok) return { error: u.error };
  return { success: true };
}

export async function getCartApi(
  token?: string | null,
): Promise<{ items?: ServerCartLine[]; error?: string }> {
  const result = await apiCall<unknown>("/get-cart", { method: "POST", body: {}, token });
  if (result.error) return { error: result.error };
  const u = unwrapEdgeData<{ items?: ServerCartLine[] }>(result.data);
  if (!u.ok) return { error: u.error };
  return { items: u.data.items ?? [] };
}

export async function updateCartItemApi(
  body: { product_id: string; quantity: number } | { cart_item_id: string; quantity: number },
  token: string,
): Promise<{ error?: string }> {
  const result = await apiCall<unknown>("/update-cart-item", {
    method: "POST",
    body,
    token,
  });
  if (result.error) return { error: result.error };
  const u = unwrapEdgeData<unknown>(result.data);
  if (!u.ok) return { error: u.error };
  return {};
}

export async function removeCartItemApi(
  body: { product_id: string } | { cart_item_id: string },
  token: string,
): Promise<{ error?: string }> {
  const result = await apiCall<unknown>("/remove-cart-item", {
    method: "POST",
    body,
    token,
  });
  if (result.error) return { error: result.error };
  const u = unwrapEdgeData<unknown>(result.data);
  if (!u.ok) return { error: u.error };
  return {};
}
