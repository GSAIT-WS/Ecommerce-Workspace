/**
 * Edge Function: process-order
 * API entry — business logic is in the service layer.
 */

import { corsHeaders } from "../_shared/cors.ts";
import {
  validateOrderInput,
  calculateOrderTotals,
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
    if (!validateOrderInput(body)) {
      return new Response(
        JSON.stringify({ error: "Invalid order payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totals = calculateOrderTotals(body);
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
