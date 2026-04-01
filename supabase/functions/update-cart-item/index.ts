/**
 * Edge Function: update-cart-item
 * Direct table queries against the `ecommerce` schema.
 * Supports identification by cart_item_id or product_id.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateUpdateCartItemParams } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
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

    const validated = validateUpdateCartItemParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { cart_item_id, product_id, quantity } = validated.params;
    const userId = auth.user_id;

    const supabase = createSupabaseServiceRoleClient();
    const db = supabase.schema("ecommerce");

    const { data: cartRow } = await db
      .from("cart")
      .select("id")
      .eq("customer_id", userId)
      .maybeSingle();

    if (!cartRow) {
      return jsonResponse({ success: false, error: "Cart not found" }, 404);
    }
    const cartId = cartRow.id as string;

    // Resolve the target cart item — by cart_item_id or by product_id
    let targetItemId: string;

    if (cart_item_id) {
      targetItemId = cart_item_id;
    } else if (product_id) {
      const { data: itemByProduct } = await db
        .from("cart_items")
        .select("id")
        .eq("cart_id", cartId)
        .eq("product_id", product_id)
        .eq("item_type", "product")
        .maybeSingle();

      if (!itemByProduct) {
        return jsonResponse({ success: false, error: "Cart item not found for product_id" }, 404);
      }
      targetItemId = (itemByProduct as Record<string, unknown>).id as string;
    } else {
      return errorResponse("cart_item_id or product_id is required", 400);
    }

    if (quantity === 0) {
      const { error: deleteErr } = await db
        .from("cart_items")
        .delete()
        .eq("id", targetItemId)
        .eq("cart_id", cartId);

      if (deleteErr) {
        return jsonResponse({ success: false, error: deleteErr.message }, 500);
      }
      return successResponse({ user_id: userId, cart_item_id: targetItemId, removed: true }, 200);
    }

    const { data: updated, error: updateErr } = await db
      .from("cart_items")
      .update({ quantity })
      .eq("id", targetItemId)
      .eq("cart_id", cartId)
      .select("id, item_type, product_id, quantity, unit_price_snapshot")
      .maybeSingle();

    if (updateErr) {
      return jsonResponse({ success: false, error: updateErr.message }, 500);
    }
    if (!updated) {
      return jsonResponse({ success: false, error: "Cart item not found" }, 404);
    }

    const row = updated as Record<string, unknown>;
    return successResponse({
      user_id: userId,
      cart_item_id: row.id,
      item_type: row.item_type ?? "product",
      quantity: Number(row.quantity),
      unit_price: row.unit_price_snapshot != null ? Number(row.unit_price_snapshot) : null,
    }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
