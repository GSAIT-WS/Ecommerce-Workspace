/**
 * Edge Function: delete-account
 * Permanently deletes the authenticated user and all associated data.
 *
 * Deletion order (children before parents to respect FK constraints):
 *   1. cart_items  (child of cart)
 *   2. cart        (parent, owned by customer)
 *   3. order_items (child of orders)
 *   4. orders      (parent, owned by customer)
 *   5. addresses
 *   6. customer_profiles
 *   7. auth.users  (service-role admin delete)
 *
 * Security: requires a valid JWT; deletion is executed via the service-role
 * client so it bypasses RLS and can call auth.admin.deleteUser().
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

  // Verify the caller is authenticated; resolve their user_id from the JWT.
  // createSupabaseClient (anon key + user's JWT) is used only for token
  // verification. All writes use the service-role client below.
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) {
    return errorResponse(auth.error, auth.status);
  }

  const userId = auth.user_id;
  const db = createSupabaseServiceRoleClient().schema("ecommerce");

  try {
    // ── 1. cart_items ─────────────────────────────────────────────────────
    // cart_items.cart_id → cart.id, so delete items before the cart row.
    const { data: cartRows } = await db
      .from("cart")
      .select("id")
      .eq("customer_id", userId);

    if (cartRows && cartRows.length > 0) {
      const cartIds = cartRows.map((c: { id: string }) => c.id);
      const { error: cartItemsErr } = await db
        .from("cart_items")
        .delete()
        .in("cart_id", cartIds);

      if (cartItemsErr) {
        return jsonResponse({ success: false, error: `cart_items: ${cartItemsErr.message}` }, 500);
      }
    }

    // ── 2. cart ───────────────────────────────────────────────────────────
    const { error: cartErr } = await db
      .from("cart")
      .delete()
      .eq("customer_id", userId);

    if (cartErr) {
      return jsonResponse({ success: false, error: `cart: ${cartErr.message}` }, 500);
    }

    // ── 3. order_items ────────────────────────────────────────────────────
    // order_items.order_id → orders.id, so delete items before orders.
    const { data: orderRows } = await db
      .from("orders")
      .select("id")
      .eq("customer_id", userId);

    if (orderRows && orderRows.length > 0) {
      const orderIds = orderRows.map((o: { id: string }) => o.id);
      const { error: orderItemsErr } = await db
        .from("order_items")
        .delete()
        .in("order_id", orderIds);

      if (orderItemsErr) {
        return jsonResponse({ success: false, error: `order_items: ${orderItemsErr.message}` }, 500);
      }
    }

    // ── 4. orders ─────────────────────────────────────────────────────────
    const { error: ordersErr } = await db
      .from("orders")
      .delete()
      .eq("customer_id", userId);

    if (ordersErr) {
      return jsonResponse({ success: false, error: `orders: ${ordersErr.message}` }, 500);
    }

    // ── 5. addresses ──────────────────────────────────────────────────────
    const { error: addressesErr } = await db
      .from("addresses")
      .delete()
      .eq("customer_id", userId);

    if (addressesErr) {
      return jsonResponse({ success: false, error: `addresses: ${addressesErr.message}` }, 500);
    }

    // ── 6. customer_profiles ──────────────────────────────────────────────
    const { error: profileErr } = await db
      .from("customer_profiles")
      .delete()
      .eq("user_id", userId);

    if (profileErr) {
      return jsonResponse({ success: false, error: `customer_profiles: ${profileErr.message}` }, 500);
    }

    // ── 7. auth.users (service-role only) ─────────────────────────────────
    const adminClient = createSupabaseServiceRoleClient();
    const { error: deleteUserErr } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteUserErr) {
      return jsonResponse({ success: false, error: deleteUserErr.message }, 500);
    }

    return successResponse(
      { deleted: true, message: "Account and all associated data have been permanently deleted." },
      200,
    );
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500,
    );
  }
});
