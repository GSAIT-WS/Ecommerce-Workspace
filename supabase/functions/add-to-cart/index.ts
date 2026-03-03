/**
 * Edge Function: add-to-cart
 * Accepts user_id, product_id, quantity.
 * Creates cart row if needed; if product already in cart, increases quantity.
 * Snapshots unit_price. Validates product exists.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateAddToCartParams } from "../_shared/services/index.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const validated = validateAddToCartParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { user_id, product_id, quantity } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    // Validate user exists (FK would fail anyway)
    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();
    if (userErr || !userRow) {
      return jsonResponse({ success: false, error: "User not found" }, 404);
    }

    // Validate product exists and get price
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, price, is_active")
      .eq("id", product_id)
      .single();
    if (productErr || !product) {
      return jsonResponse({ success: false, error: "Product not found" }, 404);
    }
    const productRow = product as Record<string, unknown>;
    if (productRow.is_active === false) {
      return jsonResponse({ success: false, error: "Product is not available" }, 400);
    }
    const unitPrice = Number(productRow.price);

    // Existing cart item for (user_id, product_id)
    const { data: existing, error: fetchErr } = await supabase
      .from("cart_items")
      .select("id, quantity, unit_price")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (fetchErr) {
      return jsonResponse({ success: false, error: fetchErr.message }, 500);
    }

    if (existing) {
      const existingRow = existing as Record<string, unknown>;
      const newQty = Number(existingRow.quantity) + quantity;
      const { error: updateErr } = await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("user_id", user_id)
        .eq("product_id", product_id);
      if (updateErr) {
        return jsonResponse({ success: false, error: updateErr.message }, 500);
      }
      return successResponse(
        { user_id, product_id, quantity: newQty, unit_price: Number(existingRow.unit_price ?? unitPrice) },
        200
      );
    }

    const { error: insertErr } = await supabase.from("cart_items").insert({
      user_id,
      product_id,
      quantity,
      unit_price: unitPrice,
    });
    if (insertErr) {
      return jsonResponse({ success: false, error: insertErr.message }, 500);
    }
    return successResponse(
      { user_id, product_id, quantity, unit_price: unitPrice },
      201
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
