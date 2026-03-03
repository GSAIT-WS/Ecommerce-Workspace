/**
 * Edge Function: get-cart
 * Accepts user_id. Returns cart items with product details.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateGetCartParams } from "../_shared/services/index.ts";

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
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    } else {
      const url = new URL(req.url);
      const user_id = url.searchParams.get("user_id");
      if (!user_id) {
        return errorResponse("user_id is required", 400);
      }
      body = { user_id };
    }

    const validated = validateGetCartParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: rows, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        quantity,
        unit_price,
        added_at,
        products (
          id,
          name,
          description,
          price,
          stock_quantity,
          category_id,
          image_url,
          is_active,
          nutrition_info,
          weight_grams
        )
      `)
      .eq("user_id", validated.params.user_id);

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const items = (rows ?? []).map((row: Record<string, unknown>) => {
      const product = row.products as Record<string, unknown> | null;
      return {
        id: row.id,
        product_id: row.product_id,
        quantity: Number(row.quantity),
        unit_price: row.unit_price != null ? Number(row.unit_price) : null,
        added_at: row.added_at,
        product: product
          ? {
              id: product.id,
              name: product.name,
              description: product.description ?? null,
              price: Number(product.price),
              stock_quantity: Number(product.stock_quantity),
              category_id: product.category_id ?? null,
              image_url: product.image_url ?? null,
              is_active: Boolean(product.is_active),
              nutrition_info: product.nutrition_info ?? null,
              weight_grams: product.weight_grams != null ? Number(product.weight_grams) : null,
            }
          : null,
      };
    });

    return successResponse(
      { user_id: validated.params.user_id, items },
      200
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
