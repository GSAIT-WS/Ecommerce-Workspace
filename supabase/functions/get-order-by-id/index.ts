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

    const validated = validateGetOrderByIdParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { user_id, order_id } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    const { data: orderRow, error: orderError } = await supabase
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

    const o = orderRow as Record<string, unknown>;
    if (o.user_id !== user_id) {
      return jsonResponse(
        { success: false, error: "Forbidden", message: "Order does not belong to user" },
        403
      );
    }

    const { data: itemRows, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        quantity,
        unit_price,
        discount_applied,
        line_total,
        products ( name )
      `)
      .eq("order_id", order_id);

    if (itemsError) {
      return jsonResponse({ success: false, error: itemsError.message }, 500);
    }

    const items: OrderItemDetail[] = (itemRows ?? []).map((row: Record<string, unknown>) => {
      const product = row.products as Record<string, unknown> | null;
      return {
        id: row.id,
        product_id: row.product_id,
        product_name: product?.name != null ? String(product.name) : null,
        quantity: Number(row.quantity),
        unit_price: Number(row.unit_price),
        line_total: Number(row.line_total),
      };
    });

    const { data: historyRows } = await supabase
      .from("order_status_history")
      .select("id, status, created_at")
      .eq("order_id", order_id)
      .order("created_at", { ascending: true });

    const status_history: OrderStatusHistoryEntry[] | undefined = historyRows?.length
      ? (historyRows as Record<string, unknown>[]).map((r) => ({
          id: r.id,
          status: r.status,
          created_at: r.created_at,
        }))
      : undefined;

    const shippingAmount = o.shipping_amount != null ? Number(o.shipping_amount) : 0;

    const result: GetOrderByIdResult = {
      id: o.id,
      user_id: o.user_id,
      created_at: o.created_at,
      updated_at: o.updated_at,
      order_status: o.status,
      payment_status: o.payment_status,
      subtotal: Number(o.subtotal),
      discount_amount: Number(o.discount_amount ?? 0),
      shipping_amount: shippingAmount,
      total: Number(o.total),
      discount_type: o.discount_type ?? null,
      shipping_address: o.shipping_address ?? null,
      payment_ref: o.payment_ref != null ? String(o.payment_ref) : null,
      items,
      ...(status_history && status_history.length > 0 && { status_history }),
    };

    return successResponse(result, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
