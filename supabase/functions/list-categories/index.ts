/**
 * Edge Function: list-categories
 * Reads ecommerce.categories via direct Postgres.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, successResponse } from "../_shared/response.ts";
import { withDb } from "../_shared/db.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const items = await withDb(async (client) => {
      const slugColResult = await client.queryObject<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'ecommerce'
           AND table_name = 'categories'
           AND column_name IN ('source_slug', 'slug')
         ORDER BY CASE column_name WHEN 'source_slug' THEN 0 ELSE 1 END
         LIMIT 1`
      );
      const slugCol = slugColResult.rows[0]?.column_name ?? "source_slug";

      const result = await client.queryObject<{
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        is_active: boolean;
        sort_order: number;
      }>(
        `SELECT
           id,
           name,
           ${slugCol} AS slug,
           image_url,
           is_active,
           sort_order
         FROM ecommerce.categories
         WHERE is_active = true
         ORDER BY sort_order ASC, name ASC`
      );
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        image_url: row.image_url ?? null,
        is_active: Boolean(row.is_active),
        sort_order: Number(row.sort_order ?? 0),
      }));
    });

    return successResponse({ items }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
