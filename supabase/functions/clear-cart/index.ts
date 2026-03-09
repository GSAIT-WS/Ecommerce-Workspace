/**
 * Edge Function: clear-cart
 * Direct table queries against the `ecommerce` schema.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateClearCartParams } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: unknown = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
    } else {
      const url = new URL(req.url);
      body = { user_id: url.searchParams.get("user_id") };
    }

    const o = body as Record<string, unknown>;
    const auth = await authenticateRequest(req, o.user_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }
    (body as Record<string, unknown>).user_id = auth.user_id;

    const validated = validateClearCartParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const db = supabase.schema("ecommerce");
    const userId = auth.user_id;

    const { data: cartRow } = await db
      .from("cart")
      .select("id")
      .eq("customer_id", userId)
      .maybeSingle();

    if (!cartRow) {
      return successResponse({ user_id: userId, cleared: true }, 200);
    }

    const { error } = await db
      .from("cart_items")
      .delete()
      .eq("cart_id", cartRow.id);

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    return successResponse({ user_id: userId, cleared: true }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
