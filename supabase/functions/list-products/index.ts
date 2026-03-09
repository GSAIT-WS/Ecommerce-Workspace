/**
 * Edge Function: list-products
 * Optional filters: category_id, search (name), min_price, max_price.
 * Paginated (limit, offset). Excludes inactive products.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { validateListProductsParams } from "../_shared/services/index.ts";

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
        search: url.searchParams.get("search") ?? undefined,
        min_price: url.searchParams.get("min_price") ? Number(url.searchParams.get("min_price")) : undefined,
        max_price: url.searchParams.get("max_price") ? Number(url.searchParams.get("max_price")) : undefined,
        limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
        offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
      };
    }

    const validated = validateListProductsParams(body);
    if (!validated.valid) {
      return errorResponse(validated.error, 400);
    }

    const { params } = validated;
    const supabase = createSupabaseServiceRoleClient();

    let query = supabase
      .schema("ecommerce")
      .from("products")
      .select("id, product_external_id, name, description, price, compare_at_price, image_url, gallery_urls, category_id, is_active, weight_grams, tags, created_at, updated_at", { count: "exact" })
      .eq("is_active", true);

    if (params.category_id) {
      query = query.eq("category_id", params.category_id);
    }
    if (params.search && params.search.trim() !== "") {
      const escaped = params.search.trim().replace(/[%_\\]/g, "\\$&");
      query = query.ilike("name", `%${escaped}%`);
    }
    if (params.min_price != null && params.min_price >= 0) {
      query = query.gte("price", params.min_price);
    }
    if (params.max_price != null && params.max_price >= 0) {
      query = query.lte("price", params.max_price);
    }

    const { data: items, error, count } = await query
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const total = count ?? items?.length ?? 0;
    const rows = (items ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      product_external_id: row.product_external_id ?? null,
      name: row.name,
      description: row.description ?? null,
      price: Number(row.price),
      compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
      image_url: row.image_url ?? null,
      gallery_urls: row.gallery_urls ?? [],
      category_id: row.category_id ?? null,
      is_active: Boolean(row.is_active),
      weight_grams: row.weight_grams != null ? Number(row.weight_grams) : null,
      tags: row.tags ?? [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return successResponse(
      { items: rows, total, limit: params.limit, offset: params.offset },
      200
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
