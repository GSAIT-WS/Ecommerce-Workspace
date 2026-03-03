/**
 * Edge Function: place-order (blueprint POST /api/orders)
 * Places order from current user's cart. Uses public.place_order RPC.
 * User from JWT (Authorization: Bearer) or body.user_id for server/testing.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabaseClient.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import {
  validatePlaceOrderRequest,
  normalizePlaceOrderPayload,
} from "../_shared/services/index.ts";
import type {
  PlaceOrderResult,
  PlaceOrderError,
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
    if (!validatePlaceOrderRequest(body)) {
      return json(
        {
          error: "Invalid request",
          code: "VALIDATION_ERROR",
          details: "shipping_address (object) is required",
        },
        400
      );
    }

    // Resolve user_id: from JWT (preferred) or body (for server/testing)
    let userId: string | null = (body as Record<string, unknown>).user_id as string | undefined ?? null;
    if (!userId) {
      const supabaseAuth = createSupabaseClient(req);
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
        req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
      );
      if (authError || !user?.id) {
        return json(
          { error: "Unauthorized", code: "AUTH_REQUIRED", message: "Valid JWT or user_id required" },
          401
        );
      }
      userId = user.id;
    }

    const payload = normalizePlaceOrderPayload(body);
    const supabase = createSupabaseServiceRoleClient();

    const { data, error: rpcError } = await supabase.rpc("place_order", {
      p_user_id: userId,
      p_shipping_address: payload.shipping_address,
      p_discount_type: payload.discount_type,
      p_discount_amount: payload.discount_amount,
      p_shipping_amount: payload.shipping_amount,
    });

    if (rpcError) {
      return json(
        {
          success: false,
          error: "rpc_error",
          code: "RPC_ERROR",
          message: rpcError.message,
        },
        500
      );
    }

    const result = data as PlaceOrderResult | PlaceOrderError | null;
    if (result == null) {
      return json(
        { success: false, error: "empty_result", message: "No result from place_order" },
        500
      );
    }

    if (!result.success) {
      const err = result as PlaceOrderError;
      const status =
        err.error === "user_not_found" || err.error === "cart_empty" ? 404
          : err.error === "insufficient_stock" || err.error === "product_inactive" ? 409
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

    const success = result as PlaceOrderResult;
    return json(
      {
        order: {
          id: success.order_id,
          total: success.total,
          status: "pending",
          subtotal: success.subtotal,
          discount_amount: success.discount_amount,
          shipping_amount: success.shipping_amount,
          payment_intent: null,
        },
        message: "Order placed successfully",
      },
      201
    );
  } catch (e) {
    return json(
      {
        error: "Bad request",
        code: "BAD_REQUEST",
        message: e instanceof Error ? e.message : "Bad request",
      },
      400
    );
  }
});
