/**
 * Edge Function: submit-bulk-inquiry
 * Public endpoint — stores B2B quote requests (no auth required).
 */

import { preflightResponse } from "../_shared/cors.ts";
import { jsonResponse, errorResponse, successResponse } from "../_shared/response.ts";
import { createSupabaseServiceRoleClient } from "../_shared/supabaseClient.ts";

function validate(body: Record<string, unknown>) {
  const product_id = typeof body.product_id === "string" ? body.product_id.trim() : "";
  const product_name = typeof body.product_name === "string" ? body.product_name.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const business = typeof body.business === "string" ? body.business.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const quantity = typeof body.quantity === "string" ? body.quantity.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!product_id) return { ok: false as const, error: "product_id is required" };
  if (!product_name) return { ok: false as const, error: "product_name is required" };
  if (!name) return { ok: false as const, error: "Name is required" };
  if (!business) return { ok: false as const, error: "Business name is required" };
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) return { ok: false as const, error: "Valid phone is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Valid email is required" };
  }
  const q = parseInt(quantity, 10);
  if (Number.isNaN(q) || q < 25) {
    return { ok: false as const, error: "Minimum quantity is 25 units" };
  }

  return {
    ok: true as const,
    params: { product_id, product_name, name, business, phone, email, quantity, message },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return preflightResponse();
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const v = validate(body);
    if (!v.ok) return errorResponse(v.error, 400);

    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.schema("ecommerce").from("bulk_inquiries").insert({
      product_id: v.params.product_id,
      product_name: v.params.product_name,
      name: v.params.name,
      business: v.params.business,
      phone: v.params.phone,
      email: v.params.email,
      quantity: v.params.quantity,
      message: v.params.message || null,
    }).select("id").single();

    if (error) {
      console.error("[submit-bulk-inquiry]", error.message);
      return errorResponse("Could not save inquiry. Please try again.", 500);
    }

    return successResponse({ id: data.id as string }, 200);
  } catch (e) {
    return jsonResponse(
      { success: false, error: e instanceof Error ? e.message : "Internal server error" },
      500
    );
  }
});
