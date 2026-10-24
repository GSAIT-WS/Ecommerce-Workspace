import { adminOrders } from "@/data/adminMockData";

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AdminPaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

export interface EcommerceOrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  status: AdminOrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  created_at: string;
}

export interface EcommerceOrderItemRow {
  id: string;
  order_id: string;
  item_type: "product" | "combo";
  product_id: string | null;
  combo_id: string | null;
  name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface EcommerceCustomerProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface EcommercePaymentAttemptRow {
  id: string;
  order_id: string;
  status: AdminPaymentStatus;
  created_at: string;
}

export interface AdminOrderCustomer {
  id: string;
  full_name: string;
  email: string | null;
}

export interface AdminOrderSummary {
  id: string;
  order_number: string;
  created_at: string;
  customer: AdminOrderCustomer;
  items_summary: string;
  total_amount: number;
  payment_status: AdminPaymentStatus | null;
  status: AdminOrderStatus;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  items: EcommerceOrderItemRow[];
}

export interface AdminOrderPage {
  items: AdminOrderSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminOrderPageParams {
  limit?: number;
  offset?: number;
}

export interface NormalizedAdminOrderPageParams {
  limit: number;
  offset: number;
}

export interface AdminOrderDataSource {
  listOrders(params: NormalizedAdminOrderPageParams): Promise<AdminOrderPage>;
  getOrderDetails(orderId: string): Promise<AdminOrderDetail | null>;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export function normalizeAdminOrderPageParams(
  params: AdminOrderPageParams = {},
): NormalizedAdminOrderPageParams {
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;
  const offset = params.offset ?? 0;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new RangeError(`limit must be an integer between 1 and ${MAX_PAGE_SIZE}`);
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("offset must be a non-negative integer");
  }

  return { limit, offset };
}

function mostRecentPaymentStatus(
  orderId: string,
  attempts: EcommercePaymentAttemptRow[],
): AdminPaymentStatus | null {
  return attempts
    .filter((attempt) => attempt.order_id === orderId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id))[0]
    ?.status ?? null;
}

export function mapEcommerceOrderRows(
  orders: EcommerceOrderRow[],
  orderItems: EcommerceOrderItemRow[],
  profiles: EcommerceCustomerProfileRow[],
  paymentAttempts: EcommercePaymentAttemptRow[] = [],
): AdminOrderSummary[] {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const itemsByOrderId = new Map<string, EcommerceOrderItemRow[]>();

  for (const item of orderItems) {
    const items = itemsByOrderId.get(item.order_id) ?? [];
    items.push(item);
    itemsByOrderId.set(item.order_id, items);
  }

  return [...orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id))
    .map((order) => {
      const profile = profilesById.get(order.customer_id);
      const items = itemsByOrderId.get(order.id) ?? [];
      return {
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        customer: {
          id: order.customer_id,
          full_name: profile?.full_name?.trim() || "Customer",
          email: profile?.email ?? null,
        },
        items_summary: items.map((item) => `${item.name_snapshot} × ${item.quantity}`).join(", "),
        total_amount: order.total_amount,
        payment_status: mostRecentPaymentStatus(order.id, paymentAttempts),
        status: order.status,
      };
    });
}

function mapDemoOrderStatus(status: string): AdminOrderStatus {
  switch (status) {
    case "Processing": return "confirmed";
    case "Packed": return "packed";
    case "Shipped": return "shipped";
    case "Delivered": return "delivered";
    default: return "pending";
  }
}

function mapDemoPaymentStatus(status: string): AdminPaymentStatus | null {
  switch (status) {
    case "Paid": return "succeeded";
    case "Pending": return "pending";
    case "Refunded": return "refunded";
    default: return null;
  }
}

const demoOrderRows: AdminOrderSummary[] = adminOrders
  .map((order) => ({
    id: order.id,
    order_number: order.id,
    created_at: new Date(order.date).toISOString(),
    customer: {
      id: `demo-${order.id}`,
      full_name: order.customer,
      email: order.email,
    },
    items_summary: order.items,
    total_amount: order.total,
    payment_status: mapDemoPaymentStatus(order.paymentStatus),
    status: mapDemoOrderStatus(order.status),
  }))
  .sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));

export const demoAdminOrderDataSource: AdminOrderDataSource = {
  async listOrders({ limit, offset }) {
    return {
      items: demoOrderRows.slice(offset, offset + limit),
      total: demoOrderRows.length,
      limit,
      offset,
    };
  },
  async getOrderDetails(orderId) {
    const order = demoOrderRows.find((item) => item.id === orderId);
    if (!order) return null;
    return {
      ...order,
      items: [],
    };
  },
};

export type AdminOrderPageLoad =
  | { ok: true; page: AdminOrderPage }
  | { ok: false; error: string };

export async function loadAdminOrderPage(
  dataSource: AdminOrderDataSource,
  params: AdminOrderPageParams = {},
): Promise<AdminOrderPageLoad> {
  try {
    const page = await dataSource.listOrders(normalizeAdminOrderPageParams(params));
    return { ok: true, page };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load orders.",
    };
  }
}

export function formatAdminOrderStatus(status: AdminOrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatAdminPaymentStatus(status: AdminPaymentStatus | null): string {
  if (status === null) return "Not recorded";
  if (status === "succeeded") return "Paid";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
