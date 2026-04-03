/**
 * Edge Function: finalize-cod-order
 * Marks a pending order as confirmed for cash-on-delivery (no online payment attempt).
 * Uses service role; ownership enforced via authenticated user id.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { isValidUuid } from "../_shared/validation.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const auth = await authenticateRequest(req, body.user_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }

    const orderId = body.order_id;
    if (!orderId || typeof orderId !== "string" || !isValidUuid(orderId)) {
      return errorResponse("order_id must be a valid UUID", 400);
    }

    const supabase = createSupabaseServiceRoleClient();

    const { data: order, error: ordErr } = await supabase
      .schema("ecommerce")
      .from("orders")
      .select("id, customer_id, status")
      .eq("id", orderId)
      .single();

    if (ordErr || !order) {
      return jsonResponse({ success: false, error: "order_not_found" }, 404);
    }

    if ((order as { customer_id: string }).customer_id !== auth.user_id) {
      return jsonResponse({ success: false, error: "forbidden" }, 403);
    }

    if ((order as { status: string }).status !== "pending") {
      return jsonResponse(
        {
          success: false,
          error: "invalid_order_status",
          message: "COD finalization only allowed when order status is pending",
          current_status: (order as { status: string }).status,
        },
        400,
      );
    }

    const { data: updated, error: updErr } = await supabase
      .schema("ecommerce")
      .from("orders")
      .update({ status: "confirmed", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("customer_id", auth.user_id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (updErr) {
      return jsonResponse({ success: false, error: updErr.message }, 500);
    }
    if (!updated) {
      return jsonResponse(
        { success: false, error: "update_failed", message: "Order could not be confirmed (wrong status or race)" },
        409,
      );
    }

    return successResponse({ order_id: orderId }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500,
    );
  }
});
