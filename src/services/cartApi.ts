/**
 * Cart API - calls Supabase Edge Functions for cart operations.
 * Used when user is authenticated. Guest cart uses CartContext (localStorage) only.
 */

import { apiCall } from "@/lib/api";

export interface AddToCartParams {
  product_id: string;
  quantity: number;
}

export async function addToCartApi(
  params: AddToCartParams,
  token?: string | null
): Promise<{ success?: boolean; error?: string }> {
  const result = await apiCall<{ success?: boolean }>("/add-to-cart", {
    method: "POST",
    body: params,
    token,
  });
  if (result.error) return { error: result.error };
  return { success: (result.data as { success?: boolean })?.success ?? true };
}

export async function getCartApi(
  token?: string | null
): Promise<{ items?: unknown[]; error?: string }> {
  const result = await apiCall<{ success?: boolean; data?: { items?: unknown[] } }>(
    "/get-cart",
    { method: "POST", body: {}, token }
  );
  if (result.error) return { error: result.error };
  const data = result.data as { data?: { items?: unknown[] } };
  return { items: data?.data?.items ?? [] };
}
