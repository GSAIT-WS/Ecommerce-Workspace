/**
 * Edge Function: payment-webhook
 * Handles payment success/failure events; idempotent via process_payment_webhook RPC.
 * On success: payment_status = paid, order_status = confirmed.
 * On failure: payment_status = failed, stock restored.
 *
 * Security: verifies X-Webhook-Signature (HMAC-SHA256) when WEBHOOK_SECRET is set.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validatePaymentWebhookParams } from "../_shared/services/index.ts";
import { verifyWebhookSignature } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const rawBody = await req.text();

    const sigResult = await verifyWebhookSignature(
      rawBody,
      req.headers.get("X-Webhook-Signature"),
    );
    if (!sigResult.valid) {
      return errorResponse(sigResult.error ?? "Signature verification failed", 401);
    }

    let body: unknown = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }

    const validated = validatePaymentWebhookParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { external_id, outcome } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    const paymentStatus = outcome === "succeeded" ? "succeeded" : "failed";

    const { data, error: rpcError } = await supabase.schema("ecommerce").rpc("process_payment_webhook", {
      p_external_id: external_id,
      p_status: paymentStatus,
      p_amount: 0,
      p_failure_reason: outcome === "failed" ? "Payment failed via webhook" : null,
    });

    if (rpcError) {
      return jsonResponse(
        { success: false, error: rpcError.message },
        500
      );
    }

    const result = data as {
      ok: boolean;
      error?: string;
      idempotent?: boolean;
      status?: string;
      order_id?: string;
      ims_release_items?: unknown;
    } | null;

    if (result == null) {
      return jsonResponse(
        { success: false, error: "No result from process_payment_webhook" },
        500
      );
    }

    if (!result.ok) {
      if (result.error === "payment_attempt_not_found") {
        return jsonResponse(
          { success: false, error: "attempt_not_found", message: "Payment attempt not found" },
          404
        );
      }
      return jsonResponse(
        { success: false, error: result.error ?? "webhook_failed" },
        400
      );
    }

    return successResponse(
      {
        ...(result.idempotent && { idempotent: true }),
        ...(result.order_id && { order_id: result.order_id }),
        ...(result.status && { payment_status: result.status }),
        message: "Webhook processed",
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
