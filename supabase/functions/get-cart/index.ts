/**
 * Edge Function: get-cart
 * Fetches cart items with product/combo details using direct table queries.
 * All tables live in the `ecommerce` schema.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateGetCartParams } from "../_shared/services/index.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: unknown = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    } else {
      const url = new URL(req.url);
      const user_id = url.searchParams.get("user_id");
      if (!user_id) return errorResponse("user_id is required", 400);
      body = { user_id };
    }

    const o = body as Record<string, unknown>;
    const auth = await authenticateRequest(req, o.user_id as string | undefined);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }
    (body as Record<string, unknown>).user_id = auth.user_id;

    const validated = validateGetCartParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const userId = auth.user_id;
    const supabase = createSupabaseServiceRoleClient();
    const db = supabase.schema("ecommerce");

    const { data: cartRow } = await db
      .from("cart")
      .select("id")
      .eq("customer_id", userId)
      .maybeSingle();

    if (!cartRow) {
      return successResponse({ user_id: userId, items: [] }, 200);
    }

    const cartId = cartRow.id as string;

    const { data: rows, error } = await db
      .from("cart_items")
      .select(`
        id,
        item_type,
        product_id,
        combo_id,
        quantity,
        unit_price_snapshot,
        customization_json,
        created_at,
        products (
          id, name, description, price, compare_at_price,
          image_url, is_active, weight_grams, tags
        ),
        combos (
          id, name, combo_price, image_url
        )
      `)
      .eq("cart_id", cartId)
      .order("created_at");

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const items = (rows ?? []).map((row: Record<string, unknown>) => {
      const product = row.products as Record<string, unknown> | null;
      const combo = row.combos as Record<string, unknown> | null;
      const itemType = (row.item_type as string) || "product";

      const base = {
        id: row.id,
        item_type: itemType,
        product_id: row.product_id ?? null,
        combo_id: row.combo_id ?? null,
        quantity: Number(row.quantity),
        unit_price: row.unit_price_snapshot != null ? Number(row.unit_price_snapshot) : null,
        created_at: row.created_at,
      };

      if (itemType === "combo") {
        return {
          ...base,
          customization_json: row.customization_json ?? null,
          product: null,
          combo: combo ? {
            id: combo.id,
            name: combo.name,
            combo_price: Number(combo.combo_price),
            image_url: combo.image_url ?? null,
          } : null,
        };
      }

      return {
        ...base,
        customization_json: null,
        product: product ? {
          id: product.id,
          name: product.name,
          description: product.description ?? null,
          price: Number(product.price),
          compare_at_price: product.compare_at_price != null ? Number(product.compare_at_price) : null,
          image_url: product.image_url ?? null,
          is_active: Boolean(product.is_active),
          weight_grams: product.weight_grams != null ? Number(product.weight_grams) : null,
          tags: product.tags ?? [],
        } : null,
        combo: null,
      };
    });

    return successResponse({ user_id: userId, items }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
