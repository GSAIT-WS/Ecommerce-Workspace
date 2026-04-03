/**
 * Edge Function: confirm-mock-payment
 * Authenticated user confirms a mock / provider-agnostic payment attempt by external_id
 * (same id returned as payment_intent_id from create-payment-intent).
 * Calls ecommerce.process_payment_webhook — same outcome as a successful payment-webhook.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { authenticateRequest } from "../_shared/auth.ts";

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

    const paymentIntentId = body.payment_intent_id;
    if (!paymentIntentId || typeof paymentIntentId !== "string" || !paymentIntentId.trim()) {
      return errorResponse("payment_intent_id is required", 400);
    }

    const externalId = paymentIntentId.trim();
    const supabase = createSupabaseServiceRoleClient();

    const { data: attempt, error: attErr } = await supabase
      .schema("ecommerce")
      .from("payment_attempts")
      .select("id, order_id, external_id, status, provider")
      .eq("external_id", externalId)
      .maybeSingle();

    if (attErr || !attempt) {
      return jsonResponse(
        { success: false, error: "payment_attempt_not_found", message: "Payment attempt not found" },
        404,
      );
    }

    const { data: order, error: ordErr } = await supabase
      .schema("ecommerce")
      .from("orders")
      .select("id, customer_id, status")
      .eq("id", attempt.order_id as string)
      .single();

    if (ordErr || !order) {
      return jsonResponse({ success: false, error: "order_not_found" }, 404);
    }

    if ((order as { customer_id: string }).customer_id !== auth.user_id) {
      return jsonResponse({ success: false, error: "forbidden" }, 403);
    }

    const provider = (attempt as { provider?: string }).provider ?? "mock";

    if (provider === "stripe") {
      const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
      if (!stripeSecret) {
        return errorResponse("Stripe is not configured on the server", 503);
      }
      const Stripe = (await import("https://esm.sh/stripe@14.21.0")).default;
      const stripe = new Stripe(stripeSecret, {
        apiVersion: "2023-10-16",
        httpClient: Stripe.createFetchHttpClient(),
      });
      const pi = await stripe.paymentIntents.retrieve(externalId);
      if (pi.status !== "succeeded") {
        return jsonResponse(
          {
            success: false,
            error: "payment_incomplete",
            message: `Payment status is ${pi.status}. Finish paying with Stripe before confirming.`,
          },
          400,
        );
      }
    }

    const { data: rpcData, error: rpcError } = await supabase.schema("ecommerce").rpc(
      "process_payment_webhook",
      {
        p_external_id: externalId,
        p_status: "succeeded",
        p_amount: 0,
        p_provider_response: null,
        p_failure_reason: null,
      },
    );

    if (rpcError) {
      return jsonResponse({ success: false, error: rpcError.message }, 500);
    }

    const result = rpcData as { ok?: boolean; error?: string; idempotent?: boolean } | null;
    if (!result?.ok) {
      return jsonResponse(
        { success: false, error: result?.error ?? "payment_confirmation_failed" },
        400,
      );
    }

    return successResponse(
      {
        order_id: (order as { id: string }).id,
        idempotent: result.idempotent === true,
      },
      200,
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500,
    );
  }
});
