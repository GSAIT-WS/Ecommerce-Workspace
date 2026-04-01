/**
 * Edge Function: cancel-order
 *
 * Cancels order if status is pending or confirmed; logs status history.
 * After cancelling, calls IMS release API to free reserved inventory.
 *
 * Uses ecommerce.cancel_order RPC. 403 if wrong user, 400 if invalid status.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateCancelOrderParams } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { releaseInventory } from "../_shared/services/imsService.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const o = body as Record<string, unknown>;
    const auth = await authenticateRequest(req, o.user_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }
    (body as Record<string, unknown>).user_id = auth.user_id;

    const validated = validateCancelOrderParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { order_id } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    const { data, error: rpcError } = await supabase.schema("ecommerce").rpc("cancel_order", {
      p_order_id: order_id,
      p_customer_id: auth.user_id,
    });

    if (rpcError) {
      return jsonResponse({ success: false, error: rpcError.message }, 500);
    }

    const result = data as { success: boolean; error?: string; message?: string; order_id?: string; current_status?: string } | null;
    if (result == null) {
      return jsonResponse({ success: false, error: "No result from cancel_order" }, 500);
    }

    if (!result.success) {
      const err = result as { success: false; error: string; message?: string; current_status?: string };
      if (err.error === "forbidden") {
        return jsonResponse(
          { success: false, error: err.error, message: err.message ?? "Order does not belong to user" },
          403
        );
      }
      if (err.error === "invalid_status" || err.error === "order_not_cancellable") {
        return jsonResponse(
          {
            success: false,
            error: err.error,
            message: err.message ?? "Order can only be cancelled when status is pending or confirmed",
            ...(err.current_status != null && { current_status: err.current_status }),
          },
          400
        );
      }
      if (err.error === "order_not_found") {
        return jsonResponse(
          { success: false, error: err.error, message: err.message ?? "Order not found" },
          404
        );
      }
      return jsonResponse(
        { success: false, error: err.error, message: err.message ?? "Cancel failed" },
        400
      );
    }

    // ── Call IMS release API to free reserved inventory ──
    const imsReleaseItems = (result as { ims_release_items?: Array<{ sku: string; quantity: number }> })
      .ims_release_items ?? [];
    if (imsReleaseItems.length > 0) {
      const releaseResult = await releaseInventory(
        (result as { order_id: string }).order_id,
        imsReleaseItems
      );
      if (!releaseResult.success) {
        console.error("[cancel-order] IMS release failed:", releaseResult.error);
        // Order is already cancelled in DB; log but don't fail the response
        // (IMS may need manual reconciliation)
      }
    }

    return successResponse(
      { order_id: (result as { order_id: string }).order_id, message: "Order cancelled" },
      200
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
