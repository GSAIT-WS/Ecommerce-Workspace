/**
 * Edge Function: get-product-by-id
 * Reads a single row from ecommerce.products (direct Postgres).
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { validateGetProductByIdParams } from "../_shared/services/index.ts";
import { getStoreProductById } from "../_shared/storeProducts.ts";

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
      if (!product_id) return errorResponse("product_id is required", 400);
      body = { product_id };
    }

    const validated = validateGetProductByIdParams(body);
    if (!validated.valid) return errorResponse(validated.error, 400);

    const product = await getStoreProductById(validated.params.product_id);
    if (!product) {
      return jsonResponse({ success: false, error: "Product not found" }, 404);
    }

    return successResponse(product, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
