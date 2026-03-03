/**
 * Edge Function: add-to-cart
 * Accepts user_id, quantity; for product: product_id; for combo: item_type='combo', customization.
 * Stock is NOT reduced here; only when order is placed.
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

    const { user_id, quantity, item_type = "product", product_id, customization } = validated.params;
    const supabase = createSupabaseServiceRoleClient();

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();
    if (userErr || !userRow) {
      return jsonResponse({ success: false, error: "User not found" }, 404);
    }

    if (item_type === "product") {
      if (!product_id) {
        return errorResponse("product_id is required for product", 400);
      }
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

      const { data: existing, error: fetchErr } = await supabase
        .from("cart_items")
        .select("id, quantity, unit_price")
        .eq("user_id", user_id)
        .eq("item_type", "product")
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
          .eq("item_type", "product")
          .eq("product_id", product_id);
        if (updateErr) {
          return jsonResponse({ success: false, error: updateErr.message }, 500);
        }
        return successResponse(
          { user_id, product_id, item_type: "product", quantity: newQty, unit_price: Number(existingRow.unit_price ?? unitPrice) },
          200
        );
      }

      const { error: insertErr } = await supabase.from("cart_items").insert({
        user_id,
        item_type: "product",
        product_id,
        quantity,
        unit_price: unitPrice,
      });
      if (insertErr) {
        return jsonResponse({ success: false, error: insertErr.message }, 500);
      }
      return successResponse(
        { user_id, product_id, item_type: "product", quantity, unit_price: unitPrice },
        201
      );
    }

    // item_type === 'combo'
    if (!customization?.items?.length) {
      return errorResponse("customization.items is required for combo", 400);
    }
    let unitPrice = 0;
    for (const it of customization.items) {
      const { data: product, error: productErr } = await supabase
        .from("products")
        .select("id, price, is_active")
        .eq("id", it.product_id)
        .single();
      if (productErr || !product) {
        return jsonResponse({ success: false, error: `Product not found: ${it.product_id}` }, 404);
      }
      const productRow = product as Record<string, unknown>;
      if (productRow.is_active === false) {
        return jsonResponse({ success: false, error: `Product not available: ${it.product_id}` }, 400);
      }
      unitPrice += Number(productRow.price) * it.quantity;
    }

    const customizationJson = {
      items: customization.items,
      gift_wrap: !!customization.gift_wrap,
      ...(customization.gift_message != null && { gift_message: String(customization.gift_message) }),
    };

    const { error: insertErr } = await supabase.from("cart_items").insert({
      user_id,
      item_type: "combo",
      product_id: null,
      combo_id: null,
      quantity,
      unit_price: unitPrice,
      customization_json: customizationJson,
    });
    if (insertErr) {
      return jsonResponse({ success: false, error: insertErr.message }, 500);
    }
    return successResponse(
      { user_id, item_type: "combo", quantity, unit_price: unitPrice, customization: customizationJson },
      201
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
