/**
 * Edge Function: create-online-order
 * Creates an online order from cart: validates customer, cart, stock;
 * applies coupon; inserts order + items; deducts IMS inventory; clears cart.
 * All persistence runs inside ecommerce.create_online_order RPC (single transaction).
 */

import { corsHeaders } from "../_shared/cors.ts";
import { errorResponse, successResponse, jsonResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import {
  validateCreateOrderRequest,
  normalizeCreateOrderPayload,
} from "../_shared/services/index.ts";
import type {
  CreateOnlineOrderResult,
  CreateOnlineOrderError,
} from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const o = body as Record<string, unknown>;
    const auth = await authenticateRequest(req, o.customer_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }
    (body as Record<string, unknown>).customer_id = auth.user_id;

    if (!validateCreateOrderRequest(body)) {
      return errorResponse("customer_id and cart_id (UUIDs) required", 400);
    }

    const payload = normalizeCreateOrderPayload(body);
    const supabase = createSupabaseServiceRoleClient();

    const { data, error: rpcError } = await supabase
      .schema("ecommerce")
      .rpc("create_online_order", {
        p_customer_id: auth.user_id,
        p_cart_id: payload.cart_id,
        p_coupon_code: payload.coupon_code,
        p_shipping_amount: payload.shipping_amount,
        p_shipping_address: payload.shipping_address,
      });

    if (rpcError) {
      return jsonResponse(
        { success: false, error: rpcError.message },
        500
      );
    }

    const result = data as CreateOnlineOrderResult | CreateOnlineOrderError | null;
    if (result == null) {
      return jsonResponse(
        { success: false, error: "No result from create_online_order" },
        500
      );
    }

    if (!result.success) {
      const err = result as CreateOnlineOrderError;
      const status =
        err.error === "customer_not_found" ||
        err.error === "cart_not_found" ||
        err.error === "cart_empty"
          ? 404
          : err.error === "insufficient_stock"
            ? 409
            : 400;
      return jsonResponse(
        {
          success: false,
          error: err.error,
          message: err.message,
          ...(err.product_id != null && {
            product_id: err.product_id,
            requested: err.requested,
            available: err.available,
          }),
        },
        status
      );
    }

    const success = result as CreateOnlineOrderResult;
    return successResponse(
      {
        order_id: success.order_id,
        subtotal: success.subtotal,
        discount_amount: success.discount_amount,
        shipping_amount: success.shipping_amount,
        total: success.total,
      },
      201
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
