/**
 * Edge Function: cart-totals
 * API entry — business logic is in the service layer.
 */

import { corsHeaders } from "../_shared/cors.ts";
import {
  validateCartItems,
  calculateCartTotals,
} from "../_shared/services/index.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : body;
    if (!validateCartItems(items)) {
      return new Response(
        JSON.stringify({ error: "Invalid cart items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totals = calculateCartTotals(items);
    return new Response(
      JSON.stringify({ ok: true, totals }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Bad request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
