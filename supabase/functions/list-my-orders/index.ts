/**
 * Edge Function: list-my-orders
 * Returns paginated list of orders for user_id, sorted by created_at DESC.
 * Accepts user_id in request body (auth later).
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateListMyOrdersParams } from "../_shared/services/index.ts";
import type { OrderSummary } from "../_shared/services/index.ts";

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
      const limit = url.searchParams.get("limit");
      const offset = url.searchParams.get("offset");
      if (!user_id) {
        return errorResponse("user_id is required", 400);
      }
      body = { user_id, ...(limit != null && { limit }), ...(offset != null && { offset }) };
    }

    const validated = validateListMyOrdersParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { user_id, limit, offset } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    const { data: rows, error: listError, count } = await supabase
      .from("orders")
      .select("id, created_at, status, payment_status, subtotal, discount_amount, shipping_amount, total", { count: "exact" })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (listError) {
      return jsonResponse({ success: false, error: listError.message }, 500);
    }

    const items: OrderSummary[] = (rows ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      created_at: row.created_at,
      order_status: row.status,
      payment_status: row.payment_status,
      total_amount: Number(row.total ?? 0),
      subtotal: row.subtotal != null ? Number(row.subtotal) : undefined,
      discount_amount: row.discount_amount != null ? Number(row.discount_amount) : undefined,
      shipping_amount: row.shipping_amount != null ? Number(row.shipping_amount) : undefined,
    }));

    const total = count ?? 0;

    return successResponse(
      { items, total, limit, offset },
      200
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
