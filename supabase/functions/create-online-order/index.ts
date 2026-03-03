/**
 * Edge Function: create-online-order
 * Creates an online order from cart: validates customer, cart, stock;
 * applies coupon; inserts order + items; deducts IMS inventory; clears cart.
 * All persistence runs inside ecommerce.create_online_order RPC (single transaction).
 */

import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import {
  validateCreateOrderRequest,
  normalizeCreateOrderPayload,
} from "../_shared/services/index.ts";
import type {
  CreateOnlineOrderResult,
  CreateOnlineOrderError,
} from "../_shared/services/index.ts";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    if (!validateCreateOrderRequest(body)) {
      return json(
        { error: "Invalid request", message: "customer_id and cart_id (UUIDs) required" },
        400
      );
    }

    const payload = normalizeCreateOrderPayload(body);
    const supabase = createSupabaseServiceRoleClient();

    const { data, error: rpcError } = await supabase
      .schema("ecommerce")
      .rpc("create_online_order", {
        p_customer_id: payload.customer_id,
        p_cart_id: payload.cart_id,
        p_coupon_code: payload.coupon_code,
        p_shipping_amount: payload.shipping_amount,
        p_shipping_address: payload.shipping_address,
      });

    if (rpcError) {
      return json(
        {
          success: false,
          error: "rpc_error",
          message: rpcError.message,
        },
        500
      );
    }

    const result = data as CreateOnlineOrderResult | CreateOnlineOrderError | null;
    if (result == null) {
      return json(
        { success: false, error: "empty_result", message: "No result from create_online_order" },
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
      return json(
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
    return json(
      {
        success: true,
        order_id: success.order_id,
        subtotal: success.subtotal,
        discount_amount: success.discount_amount,
        shipping_amount: success.shipping_amount,
        total: success.total,
      },
      201
    );
  } catch (e) {
    return json(
      {
        success: false,
        error: "bad_request",
        message: e instanceof Error ? e.message : "Bad request",
      },
      400
    );
  }
});
