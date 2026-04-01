/**
 * Edge Function: list-categories
 * Queries ecommerce.categories via the public.ecommerce_categories view.
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
      .from("ecommerce_categories")
      .select("id, name, slug, image_url, is_active");

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 500);
    }

    const items = (categories ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
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
