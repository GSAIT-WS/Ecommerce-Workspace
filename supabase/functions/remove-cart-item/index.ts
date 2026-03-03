/**
 * Edge Function: remove-cart-item
 * Accepts user_id, product_id. Removes the item from cart.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateRemoveCartItemParams } from "../_shared/services/index.ts";

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
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body", 400);
      }
    } else {
      const url = new URL(req.url);
      const user_id = url.searchParams.get("user_id");
      const product_id = url.searchParams.get("product_id");
      if (!user_id || !product_id) {
        return errorResponse("user_id and product_id are required", 400);
      }
      body = { user_id, product_id };
    }

    const validated = validateRemoveCartItemParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", validated.params.user_id)
      .eq("product_id", validated.params.product_id);

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    return successResponse(
      { user_id: validated.params.user_id, product_id: validated.params.product_id, removed: true },
      200
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
