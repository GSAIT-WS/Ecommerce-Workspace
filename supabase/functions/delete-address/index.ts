/**
 * Edge Function: delete-address
 * Calls ecommerce.delete_customer_address RPC.
 */

import { preflightResponse } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { isValidUuid } from "../_shared/validation.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body", 400);
      }
    } else {
      const url = new URL(req.url);
      body = {
        user_id: url.searchParams.get("user_id"),
        address_id: url.searchParams.get("address_id"),
      };
    }

    const auth = await authenticateRequest(req, body.user_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }

    if (!body.address_id || !isValidUuid(body.address_id)) {
      return errorResponse("address_id (valid UUID) is required", 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.schema("ecommerce").rpc("delete_customer_address", {
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

    return successResponse({ deleted: true }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
