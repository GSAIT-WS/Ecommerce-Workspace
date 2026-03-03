/**
 * Consistent JSON response shape for Edge Functions.
 * { success: boolean, data?: any, error?: string }
 */

import { corsHeaders } from "./cors.ts";

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function jsonResponse<T>(body: ApiResponse<T>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function successResponse<T>(data: T, status = 200): Response {
  return jsonResponse({ success: true, data }, status);
}

export function errorResponse(error: string, status = 400): Response {
  return jsonResponse({ success: false, error }, status);
}
