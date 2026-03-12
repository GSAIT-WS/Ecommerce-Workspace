/**
 * API configuration for Supabase Edge Functions
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const FUNCTIONS_BASE = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1` : "";

export function getFunctionsBase(): string {
  return FUNCTIONS_BASE;
}

export function hasApiConfig(): boolean {
  return !!SUPABASE_URL;
}

export interface ApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
}

export async function apiCall<T = unknown>(
  path: string,
  options: ApiCallOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { method = "GET", body, token } = options;
  const url = `${FUNCTIONS_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: (json as { error?: string })?.error || res.statusText,
        status: res.status,
      };
    }
    return { data: json as T, status: res.status };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Network error",
      status: 0,
    };
  }
}
