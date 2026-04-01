/**
 * Edge Function: cart-totals
 * In-memory cart total calculation — no DB, no auth required.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import {
  validateCartItems,
  calculateCartTotals,
} from "../_shared/services/index.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const items = Array.isArray((body as Record<string, unknown>)?.items)
      ? (body as Record<string, unknown>).items
      : body;
    if (!validateCartItems(items)) {
      return errorResponse("Invalid cart items", 400);
    }

    const totals = calculateCartTotals(items);
    return successResponse({ totals }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
