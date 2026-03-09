/**
 * Edge Function: place-order
 *
 * IMS-first flow:
 *   1. Call get_cart_ims_items to validate cart and get IMS payload
 *   2. Call IMS reserve API with pre-generated order_id
 *   3. If IMS fails → return error (no order created)
 *   4. If IMS succeeds → call place_order RPC with order_id
 *
 * User from JWT (preferred) or body.user_id for backward compat.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { isValidUuid } from "../_shared/validation.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { reserveInventory } from "../_shared/services/imsService.ts";

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

    // ── Step 1: Get IMS items (validates cart, no order created) ──
    const { data: previewData, error: previewError } = await supabase
      .schema("ecommerce")
      .rpc("get_cart_ims_items", {
        p_customer_id: userId,
        p_shipping_address_id: body.shipping_address_id as string,
        p_coupon_code: (body.coupon_code as string) ?? null,
      });

    if (previewError) {
      return jsonResponse({ success: false, error: previewError.message }, 500);
    }

    const preview = previewData as Record<string, unknown> | null;
    if (!preview || preview.ok !== true) {
      const status =
        preview?.error === "customer_not_found" ||
        preview?.error === "cart_is_empty" ||
        preview?.error === "cart_not_found"
          ? 404
          : preview?.error === "insufficient_stock" ||
              preview?.error === "insufficient_stock_for_combo"
            ? 409
            : 400;
      return jsonResponse(
        { success: false, error: (preview?.error as string) ?? "Cart validation failed", details: preview },
        status
      );
    }

    const imsItems = (preview.ims_reserve_items as Array<{ sku: string; quantity: number }>) ?? [];
    if (imsItems.length === 0) {
      return errorResponse("No items to reserve", 400);
    }

    // ── Step 2: Reserve inventory in IMS (before creating order) ──
    const orderId = crypto.randomUUID();
    const imsResult = await reserveInventory(orderId, imsItems);

    if (!imsResult.success) {
      return jsonResponse(
        {
          success: false,
          error: imsResult.error ?? "Inventory reservation failed. Please try again.",
        },
        503
      );
    }

    // ── Step 3: Create order in database (IMS already reserved) ──
    const { data, error: rpcError } = await supabase.schema("ecommerce").rpc("place_order", {
      p_customer_id: userId,
      p_shipping_address_id: body.shipping_address_id as string,
      p_coupon_code: (body.coupon_code as string) ?? null,
      p_notes: (body.notes as string) ?? null,
      p_order_id: orderId,
    });

    if (rpcError) {
      // Order creation failed after IMS reserve — log for manual IMS release if needed
      console.error("[place-order] Order creation failed after IMS reserve:", rpcError.message);
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
