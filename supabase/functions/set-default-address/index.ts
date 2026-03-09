/**
 * Edge Function: set-default-address
 * Calls ecommerce.set_default_address RPC.
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

    if (!body.address_id || !isValidUuid(body.address_id)) {
      return errorResponse("address_id (valid UUID) is required", 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.schema("ecommerce").rpc("set_default_address", {
      p_customer_id: auth.user_id,
      p_address_id: body.address_id as string,
    });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const result = data as Record<string, unknown>;
    if (result?.ok === false) {
      return jsonResponse({ success: false, error: result.error as string }, 404);
    }

    return successResponse({ address_id: body.address_id, is_default: true }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
