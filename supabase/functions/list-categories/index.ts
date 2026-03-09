/**
 * Edge Function: list-categories
 * Returns all active categories.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: categories, error } = await supabase
      .schema("ecommerce")
      .from("categories")
      .select("id, name, source_slug, image_url, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const items = (categories ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      slug: row.source_slug,
      image_url: row.image_url ?? null,
      is_active: Boolean(row.is_active),
      sort_order: Number(row.sort_order ?? 0),
    }));

    return successResponse({ items }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
