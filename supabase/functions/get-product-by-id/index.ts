/**
 * Edge Function: get-product-by-id
 * Accepts product_id (body or query). Returns full product details.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateGetProductByIdParams } from "../_shared/services/index.ts";

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
        return errorResponse("Invalid JSON body", 400);
      }
    } else {
      const url = new URL(req.url);
      const product_id = url.searchParams.get("product_id");
      if (!product_id) {
        return errorResponse("product_id is required", 400);
      }
      body = { product_id };
    }

    const validated = validateGetProductByIdParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", validated.params.product_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return jsonResponse({ success: false, error: "Product not found" }, 404);
      }
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    if (!product) {
      return jsonResponse({ success: false, error: "Product not found" }, 404);
    }

    const row = product as Record<string, unknown>;
    return successResponse({
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      price: Number(row.price),
      stock_quantity: Number(row.stock_quantity),
      category_id: row.category_id ?? null,
      image_url: row.image_url ?? null,
      is_active: Boolean(row.is_active),
      nutrition_info: row.nutrition_info ?? null,
      weight_grams: row.weight_grams != null ? Number(row.weight_grams) : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
