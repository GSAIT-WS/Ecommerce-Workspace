import { apiCall, unwrapEdgeData } from "@/lib/api";

export interface OrderSummaryRow {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  total_amount: number;
}

export interface OrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderDetailApi {
  id: string;
  order_number?: string;
  created_at: string;
  order_status: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  shipping_address: unknown;
  items: OrderItemRow[];
  shipment?: Record<string, unknown>;
}

export async function listMyOrders(
  token: string,
  opts?: { limit?: number; offset?: number },
): Promise<{ items?: OrderSummaryRow[]; total?: number; error?: string }> {
  const res = await apiCall<unknown>("/list-my-orders", {
    method: "POST",
    body: {
      limit: opts?.limit ?? 50,
      offset: opts?.offset ?? 0,
    },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData<{ items: OrderSummaryRow[]; total: number }>(res.data);
  if (u.ok === false) return { error: u.error };
  return { items: u.data.items, total: u.data.total };
}

export async function getOrderByIdApi(
  token: string,
  orderId: string,
): Promise<{ order?: OrderDetailApi; error?: string }> {
  const res = await apiCall<unknown>("/get-order-by-id", {
    method: "POST",
    body: { order_id: orderId },
    token,
  });
  if (res.error) return { error: res.error };
  const u = unwrapEdgeData<OrderDetailApi>(res.data);
  if (u.ok === false) return { error: u.error };
  return { order: u.data };
}
