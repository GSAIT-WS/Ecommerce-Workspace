/**
 * Edge Function: add-to-cart
 * Direct table queries against the `ecommerce` schema.
 * No custom RPCs needed — works with migration 0004 tables.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateAddToCartParams } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
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

    // Inject authenticated user_id into body for validation
    (body as Record<string, unknown>).user_id = auth.user_id;

    const validated = validateAddToCartParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { quantity, item_type = "product", product_id, customization } = validated.params;
    const user_id = auth.user_id;
    const supabase = createSupabaseServiceRoleClient();
    const db = supabase.schema("ecommerce");

    let cartId: string;
    const { data: existingCart } = await db
      .from("cart")
      .select("id")
      .eq("customer_id", user_id)
      .maybeSingle();

    if (existingCart) {
      cartId = existingCart.id as string;
    } else {
      const { data: newCart, error: cartErr } = await db
        .from("cart")
        .insert({ customer_id: user_id })
        .select("id")
        .single();
      if (cartErr || !newCart) {
        return jsonResponse({ success: false, error: cartErr?.message ?? "Failed to create cart" }, 500);
      }
      cartId = newCart.id as string;
    }

    if (item_type === "product") {
      if (!product_id) {
        return errorResponse("product_id is required for product", 400);
      }

      const { data: product, error: productErr } = await db
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

      const { data: existing } = await db
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("item_type", "product")
        .eq("product_id", product_id)
        .maybeSingle();

      if (existing) {
        const newQty = Number((existing as Record<string, unknown>).quantity) + quantity;
        const { error: updateErr } = await db
          .from("cart_items")
          .update({ quantity: newQty, unit_price_snapshot: unitPrice })
          .eq("id", (existing as Record<string, unknown>).id);

        if (updateErr) {
          return jsonResponse({ success: false, error: updateErr.message }, 500);
        }
        return successResponse({
          user_id, product_id, item_type: "product",
          quantity: newQty, unit_price: unitPrice,
          cart_item_id: (existing as Record<string, unknown>).id,
        }, 200);
      }

      const { data: inserted, error: insertErr } = await db
        .from("cart_items")
        .insert({
          cart_id: cartId,
          item_type: "product",
          product_id,
          quantity,
          unit_price_snapshot: unitPrice,
        })
        .select("id")
        .single();

      if (insertErr) {
        return jsonResponse({ success: false, error: insertErr.message }, 500);
      }
      return successResponse({
        user_id, product_id, item_type: "product",
        quantity, unit_price: unitPrice,
        cart_item_id: (inserted as Record<string, unknown>).id,
      }, 201);
    }

    // item_type === 'combo'
    if (!customization?.items?.length) {
      return errorResponse("customization.items is required for combo", 400);
    }

    let unitPrice = 0;
    for (const it of customization.items) {
      const { data: product, error: productErr } = await db
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

    const { data: inserted, error: insertErr } = await db
      .from("cart_items")
      .insert({
        cart_id: cartId,
        item_type: "combo",
        product_id: null,
        combo_id: null,
        quantity,
        unit_price_snapshot: unitPrice,
        customization_json: customizationJson,
      })
      .select("id")
      .single();

    if (insertErr) {
      return jsonResponse({ success: false, error: insertErr.message }, 500);
    }
    return successResponse({
      user_id, item_type: "combo", quantity, unit_price: unitPrice,
      customization: customizationJson,
      cart_item_id: (inserted as Record<string, unknown>).id,
    }, 201);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
