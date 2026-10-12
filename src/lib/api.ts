/**
 * API configuration for Supabase Edge Functions
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || "";
const FUNCTIONS_BASE = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1` : "";

export function getFunctionsBase(): string {
  return FUNCTIONS_BASE;
}

export function hasApiConfig(): boolean {
  return !!SUPABASE_URL;
}

/** Parse Edge Function JSON body `{ success, data?, error? }` */
export function unwrapEdgeData<T>(body: unknown): { ok: true; data: T } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid response" };
  }
  const o = body as Record<string, unknown>;
  if (o.success === true && "data" in o) {
    return { ok: true, data: o.data as T };
  }
  if (o.success === false && typeof o.error === "string") {
    return { ok: false, error: o.error };
  }
  return { ok: false, error: "Invalid response" };
}

/** Pull a human-readable message from Edge Function / gateway JSON bodies */
function extractHttpErrorMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== "object") return fallback;
  const o = json as Record<string, unknown>;
  if (typeof o.error === "string" && o.error.trim()) return o.error;
  if (typeof o.message === "string" && o.message.trim()) return o.message;
  return fallback;
}

/** Map raw browser/network errors to user-friendly messages */
function friendlyError(raw: string): string {
  if (
    raw === "Failed to fetch" ||
    raw.toLowerCase().includes("networkerror") ||
    raw.toLowerCase().includes("network request failed") ||
    raw.toLowerCase().includes("load failed")
  ) {
    return "Network error. Please check your connection and try again.";
  }
  if (raw.toLowerCase().includes("not authenticated") || raw.toLowerCase().includes("unauthorized")) {
    return "Please log in to save your address permanently.";
  }
  return raw;
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

  // Guard: don't attempt a fetch if the Supabase URL is not configured
  if (!FUNCTIONS_BASE) {
    console.warn(
      `[PURVITA API] VITE_SUPABASE_URL is not set — skipping request to ${path}`
    );
    return {
      error: "Service is not configured. Please contact support.",
      status: 0,
    };
  }

  const url = `${FUNCTIONS_BASE}${path}`;

  // Debug log — shows URL and whether a bearer token is attached
  console.log(
    `[PURVITA API] ${method} ${url} | authenticated: ${token ? "yes" : "no"}`
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Always send the anon key so Edge Functions can verify the request
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${token || SUPABASE_ANON_KEY}`,
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = extractHttpErrorMessage(json, res.statusText || "Request failed");
      console.warn(`[PURVITA API] ${method} ${path} → ${res.status}:`, errMsg);
      return { error: friendlyError(errMsg), status: res.status };
    }

    // Some proxies misbehave; treat logical failures in JSON as errors even when status is 2xx
    if (json && typeof json === "object") {
      const o = json as Record<string, unknown>;
      if (o.success === false && typeof o.error === "string" && o.error.trim()) {
        return { error: friendlyError(o.error), status: res.status };
      }
    }

    return { data: json as T, status: res.status };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Unknown network error";
    console.error(`[PURVITA API] Network error for ${method} ${path}:`, raw);
    return { error: friendlyError(raw), status: 0 };
  }
}
