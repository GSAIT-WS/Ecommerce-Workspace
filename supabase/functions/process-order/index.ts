/**
 * Edge Function: process-order
 * In-memory order total calculation — no DB, no auth required.
 */

import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import {
  validateOrderInput,
  calculateOrderTotals,
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

    if (!validateOrderInput(body)) {
      return errorResponse("Invalid order payload", 400);
    }

    const totals = calculateOrderTotals(body);
    return successResponse({ totals }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
