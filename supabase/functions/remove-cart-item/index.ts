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
      const cart_item_id = url.searchParams.get("cart_item_id");
      if (!user_id) {
        return errorResponse("user_id is required", 400);
      }
      if (!cart_item_id && !product_id) {
        return errorResponse("Either cart_item_id or product_id is required", 400);
      }
      body = { user_id, ...(cart_item_id ? { cart_item_id } : {}), ...(product_id ? { product_id } : {}) };
    }

    const validated = validateRemoveCartItemParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    let q = supabase.from("cart_items").delete().eq("user_id", validated.params.user_id);
    if (validated.params.cart_item_id) {
      q = q.eq("id", validated.params.cart_item_id);
    } else {
      q = q.eq("product_id", validated.params.product_id!);
    }
    const { error } = await q;

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    return successResponse(
      {
        user_id: validated.params.user_id,
        ...(validated.params.cart_item_id
          ? { cart_item_id: validated.params.cart_item_id }
          : { product_id: validated.params.product_id }),
        removed: true,
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
