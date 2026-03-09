/**
 * Edge Function: place-order
 * Calls ecommerce.place_order RPC with proper signature:
 *   (p_customer_id, p_shipping_address_id, p_coupon_code, p_notes)
 * User from JWT (preferred) or body.user_id for backward compat.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { isValidUuid } from "../_shared/validation.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
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
    const userId = auth.user_id;

    if (!body.shipping_address_id || typeof body.shipping_address_id !== "string") {
      return errorResponse("shipping_address_id is required", 400);
    }
    if (!isValidUuid(body.shipping_address_id)) {
      return errorResponse("shipping_address_id must be a valid UUID", 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data, error: rpcError } = await supabase.schema("ecommerce").rpc("place_order", {
      p_customer_id: userId,
      p_shipping_address_id: body.shipping_address_id as string,
      p_coupon_code: (body.coupon_code as string) ?? null,
      p_notes: (body.notes as string) ?? null,
    });

    if (rpcError) {
      return jsonResponse({ success: false, error: rpcError.message }, 500);
    }

    const result = data as Record<string, unknown> | null;
    if (!result) {
      return jsonResponse({ success: false, error: "empty_result" }, 500);
    }

    if (result.ok === false) {
      const status =
        result.error === "customer_not_found" || result.error === "cart_is_empty" ? 404
        : result.error === "insufficient_stock" ? 409
        : 400;
      return jsonResponse({ success: false, error: result.error, details: result }, status);
    }

    return successResponse({
      order: {
        id: result.order_id,
        order_number: result.order_number,
        total_amount: result.total_amount,
        status: result.status,
      },
    }, 201);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
