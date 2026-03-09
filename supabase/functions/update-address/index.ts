/**
 * Edge Function: update-address
 * Calls ecommerce.update_customer_address RPC.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateUpdateAddressParams } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
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

    const validated = validateUpdateAddressParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const p = validated.params;
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.schema("ecommerce").rpc("update_customer_address", {
      p_customer_id: auth.user_id,
      p_address_id: p.address_id,
      p_label: p.label ?? null,
      p_recipient_name: p.recipient_name ?? null,
      p_phone: p.phone ?? null,
      p_address_line1: p.address_line1 ?? null,
      p_address_line2: p.address_line2 !== undefined ? (p.address_line2 || "") : null,
      p_city: p.city ?? null,
      p_state: p.state ?? null,
      p_postal_code: p.postal_code ?? null,
      p_country: p.country ?? null,
      p_latitude: p.latitude ?? null,
      p_longitude: p.longitude ?? null,
    });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const result = data as Record<string, unknown>;
    if (result?.ok === false) {
      return jsonResponse({ success: false, error: result.error as string }, 404);
    }

    return successResponse({ address_id: p.address_id }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
