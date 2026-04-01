/**
 * Edge Function: get-my-addresses
 * Calls ecommerce.get_my_addresses RPC.
 */

import { preflightResponse } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let bodyUserId: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      bodyUserId = url.searchParams.get("user_id");
    } else {
      let body: Record<string, unknown> = {};
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body", 400);
      }
      bodyUserId = (body.user_id as string) ?? null;
    }

    const auth = await authenticateRequest(req, bodyUserId);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.schema("ecommerce").rpc("get_my_addresses", {
      p_customer_id: auth.user_id,
    });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const result = data as { ok: boolean; addresses: unknown[] };
    return successResponse({ addresses: result?.addresses ?? [] }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
