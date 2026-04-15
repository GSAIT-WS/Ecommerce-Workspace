/**
 * Edge Function: list-products
 * Reads active products from ecommerce.products (via public.list_store_products RPC).
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
      try { body = await req.json(); } catch { body = {}; }
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
    const supabase = createSupabaseServiceRoleClient();

    const { data: rpcData, error: rpcError } = await supabase.rpc("list_store_products", {
      p_category_id: params.category_id ?? null,
      p_category_slug: params.category_slug ?? null,
      p_search: params.search ?? null,
      p_min_price: params.min_price ?? null,
      p_max_price: params.max_price ?? null,
      p_limit: params.limit,
      p_offset: params.offset,
    });

    if (rpcError) {
      return jsonResponse({ success: false, error: rpcError.message }, 500);
    }

    const payload = rpcData as { items?: unknown[]; total?: number } | null;
    const rawItems = Array.isArray(payload?.items) ? payload.items : [];
    const total = typeof payload?.total === "number" ? payload.total : rawItems.length;

    const rows = rawItems.map((row: Record<string, unknown>) => ({
      id: row.id,
      product_external_id: row.product_external_id ?? null,
      name: row.name,
      description: row.description ?? null,
      price: Number(row.price),
      compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
      image_url: row.image_url ?? null,
      gallery_urls: row.gallery_urls ?? [],
      category_id: row.category_id ?? null,
      category_slug: row.category_slug ?? null,
      is_active: Boolean(row.is_active),
      is_in_deletion_period: Boolean(row.is_in_deletion_period),
      weight_grams: row.weight_grams != null ? Number(row.weight_grams) : null,
      tags: row.tags ?? [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return successResponse({ items: rows, total, limit: params.limit, offset: params.offset }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
