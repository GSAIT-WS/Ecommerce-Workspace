/**
 * Edge Function: payment-webhook
 * Handles payment success/failure events; idempotent via process_payment_webhook RPC.
 * On success: payment_status = paid, order_status = confirmed.
 * On failure: payment_status = failed, stock restored.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validatePaymentWebhookParams } from "../_shared/services/index.ts";

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
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const validated = validatePaymentWebhookParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { external_id, outcome } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    const { data, error: rpcError } = await supabase.rpc("process_payment_webhook", {
      p_external_id: external_id,
      p_outcome: outcome,
    });

    if (rpcError) {
      return jsonResponse(
        { success: false, error: "rpc_error", message: rpcError.message },
        500
      );
    }

    const result = data as {
      success: boolean;
      error?: string;
      message?: string;
      idempotent?: boolean;
      order_id?: string;
      payment_status?: string;
      order_status?: string;
    } | null;

    if (result == null) {
      return jsonResponse(
        { success: false, error: "No result from process_payment_webhook" },
        500
      );
    }

    if (!result.success) {
      if ((result as { error?: string }).error === "attempt_not_found") {
        return json(
          { success: false, error: "attempt_not_found", message: result.message ?? "Payment attempt not found" },
          404
        );
      }
      if ((result as { error?: string }).error === "invalid_outcome") {
        return errorResponse(result.message ?? "Invalid outcome", 400);
      }
      return jsonResponse(
        { success: false, error: (result as { error: string }).error, message: result.message },
        400
      );
    }

    return json(
      {
        success: true,
        ...(result.idempotent && { idempotent: true }),
        ...(result.order_id && { order_id: result.order_id }),
        ...(result.payment_status && { payment_status: result.payment_status }),
        ...(result.order_status && { order_status: result.order_status }),
        message: result.message ?? "Webhook processed",
      },
      200
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
