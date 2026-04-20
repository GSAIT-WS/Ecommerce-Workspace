import { apiCall, unwrapEdgeData } from "@/lib/api";
import type { CartItem } from "@/context/CartContext";
import { addToCartApi } from "@/services/cartApi";

export interface PlacedOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
}

export async function clearServerCart(token: string): Promise<{ error?: string }> {
  const res = await apiCall<unknown>("/clear-cart", { method: "POST", body: {}, token });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData(res.data);
  if (u.ok === false) return { error: u.error };
  return {};
}

export async function addProductToServerCart(
  token: string,
  productId: string,
  quantity: number,
): Promise<{ error?: string }> {
  const res = await apiCall<unknown>("/add-to-cart", {
    method: "POST",
    body: { product_id: productId, quantity, item_type: "product" },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData(res.data);
  if (u.ok === false) return { error: u.error };
  return {};
}

/** Replace server cart with local items (products only). */
export async function syncLocalCartToServer(
  token: string,
  items: CartItem[],
): Promise<{ error?: string }> {
  const cleared = await clearServerCart(token);
  if (cleared.error) return cleared;

  for (const item of items) {
    if (item.serverCartItemId && item.comboCustomization) {
      const add = await addToCartApi(
        {
          item_type: "combo",
          quantity: item.quantity,
          customization: item.comboCustomization,
        },
        token,
      );
      if (add.error) return { error: add.error };
      continue;
    }
    if (item.serverCartItemId) continue;
    const add = await addProductToServerCart(token, item.id, item.quantity);
    if (add.error) return { error: add.error };
  }
  return {};
}

export async function placeOrder(
  token: string,
  params: { shipping_address_id: string; coupon_code?: string | null; notes?: string | null },
): Promise<{ order?: PlacedOrder; error?: string }> {
  const res = await apiCall<unknown>("/place-order", {
    method: "POST",
    body: {
      shipping_address_id: params.shipping_address_id,
      ...(params.coupon_code ? { coupon_code: params.coupon_code } : {}),
      ...(params.notes ? { notes: params.notes } : {}),
    },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData<{ order: PlacedOrder }>(res.data);
  if (u.ok === false) return { error: u.error };
  return { order: u.data.order };
}

export type PaymentIntentPayload = {
  payment_intent_id: string;
  client_secret?: string;
  provider?: string;
  amount_cents?: number;
  currency?: string;
};

export async function createPaymentIntent(
  token: string,
  orderId: string,
): Promise<{ intent?: PaymentIntentPayload; error?: string }> {
  const res = await apiCall<unknown>("/create-payment-intent", {
    method: "POST",
    body: { order_id: orderId },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData<PaymentIntentPayload>(res.data);
  if (u.ok === false) return { error: u.error };
  return { intent: u.data };
}

export async function confirmMockPayment(
  token: string,
  paymentIntentId: string,
): Promise<{ error?: string }> {
  const res = await apiCall<unknown>("/confirm-mock-payment", {
    method: "POST",
    body: { payment_intent_id: paymentIntentId },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData<unknown>(res.data);
  if (u.ok === false) return { error: u.error };
  return {};
}

export async function finalizeCodOrder(token: string, orderId: string): Promise<{ error?: string }> {
  const res = await apiCall<unknown>("/finalize-cod-order", {
    method: "POST",
    body: { order_id: orderId },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData<unknown>(res.data);
  if (u.ok === false) return { error: u.error };
  return {};
}
