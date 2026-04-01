/**
 * Edge Function: get-order-by-id
 * Returns full order details for order_id if it belongs to user_id.
 * 403 if order exists but belongs to another user; 404 if order not found.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateGetOrderByIdParams } from "../_shared/services/index.ts";
import type { GetOrderByIdResult, OrderItemDetail, OrderStatusHistoryEntry } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: unknown = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    } else {
      const url = new URL(req.url);
      const user_id = url.searchParams.get("user_id");
      const order_id = url.searchParams.get("order_id");
      if (!user_id || !order_id) {
        return errorResponse("user_id and order_id are required", 400);
      }
      body = { user_id, order_id };
    }

    const o = body as Record<string, unknown>;
    const auth = await authenticateRequest(req, o.user_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }
    (body as Record<string, unknown>).user_id = auth.user_id;

    const validated = validateGetOrderByIdParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { order_id } = validated.params;
    const userId = auth.user_id;
    const supabase = createSupabaseServiceRoleClient();

    const { data: orderRow, error: orderError } = await supabase
      .schema("ecommerce")
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !orderRow) {
      return jsonResponse(
        { success: false, error: orderError?.code === "PGRST116" ? "Order not found" : (orderError?.message ?? "Order not found") },
        404
      );
    }

    const ord = orderRow as Record<string, unknown>;
    if (ord.customer_id !== userId) {
      return jsonResponse(
        { success: false, error: "forbidden", message: "Order does not belong to user" },
        403
      );
    }

    // Fetch IMS shipment status if order is linked (ims_order_id or shipment_number)
    let shipment: Record<string, unknown> | null = null;
    const imsOrderId = ord.ims_order_id as string | null;
    const shipmentNumber = ord.shipment_number as string | null;
    if (imsOrderId || shipmentNumber) {
      const { data: shipByOrder } = imsOrderId
        ? await supabase.schema("ecommerce").from("shipment_status").select("*").eq("order_id", imsOrderId).maybeSingle()
        : { data: null };
      const { data: shipByNumber } = !shipByOrder && shipmentNumber
        ? await supabase.schema("ecommerce").from("shipment_status").select("*").eq("shipment_number", shipmentNumber).maybeSingle()
        : { data: null };
      const shipRow = shipByOrder ?? shipByNumber;
      if (shipRow) shipment = shipRow as Record<string, unknown>;
    }

    const { data: itemRows, error: itemsError } = await supabase
      .schema("ecommerce")
      .from("order_items")
      .select("id, product_id, name_snapshot, quantity, unit_price, line_total")
      .eq("order_id", order_id);

    if (itemsError) {
      return jsonResponse({ success: false, error: itemsError.message }, 500);
    }

    const items: OrderItemDetail[] = (itemRows ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.name_snapshot != null ? String(row.name_snapshot) : null,
      quantity: Number(row.quantity),
      unit_price: Number(row.unit_price),
      line_total: Number(row.line_total),
    }));

    const { data: historyRows } = await supabase
      .schema("ecommerce")
      .from("order_status_history")
      .select("id, new_status, created_at")
      .eq("order_id", order_id)
      .order("created_at", { ascending: true });

    const status_history: OrderStatusHistoryEntry[] | undefined = historyRows?.length
      ? (historyRows as Record<string, unknown>[]).map((r) => ({
          id: r.id,
          status: r.new_status,
          created_at: r.created_at,
        }))
      : undefined;

    const shippingAmount = ord.shipping_amount != null ? Number(ord.shipping_amount) : 0;

    const result: GetOrderByIdResult = {
      id: ord.id,
      user_id: ord.customer_id,
      created_at: ord.created_at,
      updated_at: ord.updated_at,
      order_status: ord.status,
      subtotal: Number(ord.subtotal),
      discount_amount: Number(ord.discount_amount ?? 0),
      shipping_amount: shippingAmount,
      total: Number(ord.total_amount),
      shipping_address: ord.shipping_address_snapshot ?? null,
      items,
      ...(status_history && status_history.length > 0 && { status_history }),
      ...(shipment && {
        shipment: {
          source_shipment_id: shipment.source_shipment_id,
          order_id: shipment.order_id,
          order_date: shipment.order_date,
          status: shipment.status,
          shipment_number: shipment.shipment_number ?? null,
          estimated_delivery: shipment.estimated_delivery ?? null,
          tracking_notes: shipment.tracking_notes ?? null,
          source_updated_at: shipment.source_updated_at ?? null,
          synced_at: shipment.synced_at,
        },
      }),
    };

    return successResponse(result, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
