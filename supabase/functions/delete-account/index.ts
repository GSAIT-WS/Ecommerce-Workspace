/**
 * Edge Function: delete-account
 * Permanently deletes the authenticated user and all associated data.
 * Requires a valid JWT — uses service-role client for admin deletion.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";
import { authenticateRequest } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return errorResponse(auth.error, auth.status);
    }

    const userId = auth.user_id;
    const supabase = createSupabaseServiceRoleClient();

    const cleanupTables = [
      { schema: "ecommerce", table: "cart", column: "customer_id" },
      { schema: "ecommerce", table: "addresses", column: "customer_id" },
      { schema: "ecommerce", table: "order_items", column: "order_id", via: "orders" },
      { schema: "ecommerce", table: "orders", column: "customer_id" },
    ];

    for (const entry of cleanupTables) {
      if (entry.via === "orders") {
        const { data: orders } = await supabase
          .schema(entry.schema)
          .from("orders")
          .select("id")
          .eq("customer_id", userId);

        if (orders && orders.length > 0) {
          const orderIds = orders.map((o: { id: string }) => o.id);
          await supabase
            .schema(entry.schema)
            .from(entry.table)
            .delete()
            .in(entry.column, orderIds);
        }
        continue;
      }

      await supabase
        .schema(entry.schema)
        .from(entry.table)
        .delete()
        .eq(entry.column, userId);
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      return jsonResponse(
        { success: false, error: deleteError.message },
        500,
      );
    }

    return successResponse({ deleted: true }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500,
    );
  }
});
