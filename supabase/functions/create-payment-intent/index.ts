/**
 * Edge Function: create-payment-intent
 * Creates a payment intent for an order: validates ownership, payment_status = pending,
 * inserts payment_attempt, returns Stripe-ready or mock payment metadata.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse, errorResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateCreatePaymentIntentParams } from "../_shared/services/index.ts";
import type { CreatePaymentIntentResult } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

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

    const validated = validateCreatePaymentIntentParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { order_id } = validated.params;
    const userId = auth.user_id;
    const supabase = createSupabaseServiceRoleClient();

    const { data: order, error: orderError } = await supabase
      .schema("ecommerce")
      .from("orders")
      .select("id, customer_id, total_amount, status")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return jsonResponse(
        { success: false, error: "order_not_found", message: "Order not found" },
        404
      );
    }

    if ((order as { customer_id: string }).customer_id !== userId) {
      return jsonResponse(
        { success: false, error: "forbidden", message: "Order does not belong to user" },
        403
      );
    }

    if ((order as { status: string }).status !== "pending") {
      return jsonResponse(
        {
          success: false,
          error: "invalid_order_status",
          message: "Payment intent only allowed when order status is pending",
          current_status: (order as { status: string }).status,
        },
        400
      );
    }

    const totalNum = Number((order as { total_amount: number }).total_amount);
    const amountCents = Math.round(totalNum * 100);
    const externalId = `pi_mock_${crypto.randomUUID().replace(/-/g, "")}`;

    const { data: attempt, error: insertError } = await supabase
      .schema("ecommerce")
      .from("payment_attempts")
      .insert({
        order_id,
        external_id: externalId,
        amount: totalNum,
        currency: "INR",
        status: "pending",
        provider: "mock",
      })
      .select("id")
      .single();

    if (insertError) {
      return jsonResponse(
        { success: false, error: "insert_failed", message: insertError.message },
        500
      );
    }

    const result: CreatePaymentIntentResult = {
      success: true,
      payment_intent_id: externalId,
      client_secret: `pi_mock_secret_${(attempt as { id: string }).id}`,
      amount_cents: amountCents,
      currency: "INR",
      order_id,
    };

    return successResponse(result, 201);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
