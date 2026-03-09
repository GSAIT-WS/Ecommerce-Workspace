/**
 * Edge Function: add-address
 * Calls ecommerce.add_customer_address RPC.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateAddAddressParams } from "../_shared/services/index.ts";
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

    const validated = validateAddAddressParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const p = validated.params;
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.schema("ecommerce").rpc("add_customer_address", {
      p_customer_id: auth.user_id,
      p_label: p.label,
      p_recipient_name: p.recipient_name,
      p_phone: p.phone,
      p_address_line1: p.address_line1,
      p_address_line2: p.address_line2 ?? null,
      p_city: p.city,
      p_state: p.state,
      p_postal_code: p.postal_code,
      p_country: p.country,
      p_is_default: !!p.is_default,
    });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const result = data as Record<string, unknown>;
    if (result?.ok === false) {
      return errorResponse(result.error as string, 400);
    }

    return successResponse({ address_id: result.address_id }, 201);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
