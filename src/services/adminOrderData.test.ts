import { describe, expect, it, vi } from "vitest";
import {
  loadAdminOrderPage,
  mapEcommerceOrderRows,
  normalizeAdminOrderPageParams,
  type AdminOrderDataSource,
  type EcommerceOrderRow,
} from "./adminOrderData";

const orders: EcommerceOrderRow[] = [
  {
    id: "order-old",
    order_number: "ECO-OLD",
    customer_id: "customer-1",
    status: "delivered",
    subtotal: 100,
    discount_amount: 0,
    shipping_amount: 0,
    total_amount: 100,
    created_at: "2026-10-21T10:00:00.000Z",
  },
  {
    id: "order-new",
    order_number: "ECO-NEW",
    customer_id: "customer-2",
    status: "confirmed",
    subtotal: 250,
    discount_amount: 0,
    shipping_amount: 0,
    total_amount: 250,
    created_at: "2026-10-22T10:00:00.000Z",
  },
];

describe("admin order data boundary", () => {
  it("maps persisted field names and returns orders newest first", () => {
    const mapped = mapEcommerceOrderRows(
      orders,
      [
        {
          id: "item-1",
          order_id: "order-new",
          item_type: "product",
          product_id: "product-1",
          combo_id: null,
          name_snapshot: "Millet Muesli",
          unit_price: 125,
          quantity: 2,
          line_total: 250,
        },
      ],
      [{ id: "customer-2", full_name: "Example Customer", email: "customer@example.test" }],
      [{ id: "attempt-1", order_id: "order-new", status: "succeeded", created_at: "2026-10-22T10:01:00.000Z" }],
    );

    expect(mapped.map((order) => order.id)).toEqual(["order-new", "order-old"]);
    expect(mapped[0]).toMatchObject({
      order_number: "ECO-NEW",
      status: "confirmed",
      total_amount: 250,
      payment_status: "succeeded",
      customer: { id: "customer-2", full_name: "Example Customer", email: "customer@example.test" },
      items_summary: "Millet Muesli × 2",
    });
    expect(mapped[1].customer.full_name).toBe("Customer");
    expect(mapped[1].payment_status).toBeNull();
  });

  it("uses the most recent payment attempt status for display", () => {
    const mapped = mapEcommerceOrderRows(
      [orders[0]],
      [],
      [],
      [
        { id: "attempt-old", order_id: "order-old", status: "failed", created_at: "2026-10-21T10:00:00.000Z" },
        { id: "attempt-new", order_id: "order-old", status: "succeeded", created_at: "2026-10-21T10:02:00.000Z" },
      ],
    );

    expect(mapped[0].payment_status).toBe("succeeded");
  });

  it("validates and defaults pagination parameters", () => {
    expect(normalizeAdminOrderPageParams()).toEqual({ limit: 10, offset: 0 });
    expect(normalizeAdminOrderPageParams({ limit: 25, offset: 50 })).toEqual({ limit: 25, offset: 50 });
    expect(() => normalizeAdminOrderPageParams({ limit: 101 })).toThrow(RangeError);
    expect(() => normalizeAdminOrderPageParams({ offset: -1 })).toThrow(RangeError);
  });

  it("returns an explicit empty page from the data source", async () => {
    const dataSource: AdminOrderDataSource = {
      listOrders: vi.fn(async ({ limit, offset }) => ({ items: [], total: 0, limit, offset })),
      getOrderDetails: vi.fn(async () => null),
    };

    await expect(loadAdminOrderPage(dataSource)).resolves.toEqual({
      ok: true,
      page: { items: [], total: 0, limit: 10, offset: 0 },
    });
    expect(dataSource.listOrders).toHaveBeenCalledWith({ limit: 10, offset: 0 });
  });

  it("passes normalized pagination parameters to the data source", async () => {
    const dataSource: AdminOrderDataSource = {
      listOrders: vi.fn(async ({ limit, offset }) => ({ items: [], total: 0, limit, offset })),
      getOrderDetails: vi.fn(async () => null),
    };

    const result = await loadAdminOrderPage(dataSource, { limit: 25, offset: 50 });

    expect(result).toMatchObject({ ok: true, page: { limit: 25, offset: 50 } });
    expect(dataSource.listOrders).toHaveBeenCalledWith({ limit: 25, offset: 50 });
  });

  it("surfaces data-source errors without falling back to sample records", async () => {
    const dataSource: AdminOrderDataSource = {
      listOrders: vi.fn(async () => { throw new Error("Order service unavailable"); }),
      getOrderDetails: vi.fn(async () => null),
    };

    await expect(loadAdminOrderPage(dataSource, { limit: 20, offset: 40 })).resolves.toEqual({
      ok: false,
      error: "Order service unavailable",
    });
  });
});
