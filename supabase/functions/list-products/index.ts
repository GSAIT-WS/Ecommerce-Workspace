/**
 * Edge Function: list-products
 * Reads active products from ecommerce.products (direct Postgres).
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { validateListProductsParams } from "../_shared/services/index.ts";
import { listStoreProducts } from "../_shared/storeProducts.ts";

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
      body = {
        category_id: url.searchParams.get("category_id") ?? undefined,
        category_slug: url.searchParams.get("category_slug") ?? undefined,
        search: url.searchParams.get("search") ?? undefined,
        min_price: url.searchParams.get("min_price") ? Number(url.searchParams.get("min_price")) : undefined,
        max_price: url.searchParams.get("max_price") ? Number(url.searchParams.get("max_price")) : undefined,
        limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
        offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
      };
    }

    const validated = validateListProductsParams(body);
    if (!validated.valid) return errorResponse(validated.error, 400);

    const { params } = validated;
    const { items, total } = await listStoreProducts({
      category_id: params.category_id ?? null,
      category_slug: params.category_slug ?? null,
      search: params.search ?? null,
      min_price: params.min_price ?? null,
      max_price: params.max_price ?? null,
      limit: params.limit,
      offset: params.offset,
    });

    return successResponse({ items, total, limit: params.limit, offset: params.offset }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
