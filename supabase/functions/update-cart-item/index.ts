/**
 * Edge Function: update-cart-item
 * Accepts user_id, product_id, quantity.
 * If quantity = 0, removes the item. Otherwise validates positive quantity.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateUpdateCartItemParams } from "../_shared/services/index.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const validated = validateUpdateCartItemParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { user_id, product_id, cart_item_id, quantity } = validated.params;
    const supabase = createSupabaseServiceRoleClient();
    const byId = !!cart_item_id;

    if (quantity === 0) {
      let q = supabase.from("cart_items").delete().eq("user_id", user_id);
      if (byId) q = q.eq("id", cart_item_id!);
      else q = q.eq("product_id", product_id!);
      const { error: deleteErr } = await q;
      if (deleteErr) {
        return jsonResponse({ success: false, error: deleteErr.message }, 500);
      }
      return successResponse({ user_id, ...(byId ? { cart_item_id } : { product_id }), removed: true }, 200);
    }

    let updateQ = supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user_id);
    if (byId) updateQ = updateQ.eq("id", cart_item_id!);
    else updateQ = updateQ.eq("product_id", product_id!);
    const { data: updated, error: updateErr } = await updateQ.select("id, item_type, product_id, quantity, unit_price").maybeSingle();

    if (updateErr) {
      return jsonResponse({ success: false, error: updateErr.message }, 500);
    }
    if (!updated) {
      return jsonResponse({ success: false, error: "Cart item not found" }, 404);
    }

    const row = updated as Record<string, unknown>;
    return successResponse(
      {
        user_id,
        ...(byId ? { cart_item_id: row.id } : { product_id: row.product_id }),
        item_type: row.item_type ?? "product",
        quantity: Number(row.quantity),
        unit_price: row.unit_price != null ? Number(row.unit_price) : null,
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
