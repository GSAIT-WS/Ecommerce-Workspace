/**
 * IMS (Inventory Management System) HTTP client.
 *
 * CrunchX communicates with the external IMS via HTTP API for:
 * - Inventory reservation (on order placement)
 * - Inventory release (on order cancellation or payment failure)
 *
 * Environment variables:
 *   IMS_BASE_URL  - Base URL of IMS API (e.g. https://ims.example.com/api)
 *   IMS_API_KEY  - Optional API key for authentication
 */

export interface ImsReservationItem {
  sku: string;
  quantity: number;
}

export interface ImsReservationRequest {
  order_id: string;
  items: ImsReservationItem[];
}

export interface ImsReleaseRequest {
  order_id: string;
  items: ImsReservationItem[];
}

export interface ImsReservationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

function getImsBaseUrl(): string | null {
  return Deno.env.get("IMS_BASE_URL") ?? null;
}

function getImsApiKey(): string | null {
  return Deno.env.get("IMS_API_KEY") ?? null;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = getImsApiKey();
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
    headers["X-API-Key"] = apiKey;
  }
  return headers;
}

/**
 * Reserve inventory in IMS for an order.
 * Call this BEFORE creating the order in CrunchX.
 * If this fails, do NOT create the order.
 */
export async function reserveInventory(
  orderId: string,
  items: ImsReservationItem[]
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getImsBaseUrl();
  if (!baseUrl) {
    console.warn("[IMS] IMS_BASE_URL not set; skipping reservation (dev mode)");
    return { success: true };
  }

  const payload: ImsReservationRequest = { order_id: orderId, items };
  const url = `${baseUrl.replace(/\/$/, "")}/reserve`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({})) as ImsReservationResponse & { success?: boolean };
    console.log("[IMS] Reserve response:", res.status, JSON.stringify(body));

    if (!res.ok) {
      const errMsg =
        (body as { error?: string }).error ??
        (body as { message?: string }).message ??
        `IMS reservation failed: ${res.status}`;
      return { success: false, error: errMsg };
    }

    if (body.success === false) {
      return {
        success: false,
        error:
          (body as { error?: string }).error ??
          (body as { message?: string }).message ??
          "Inventory reservation failed",
      };
    }

    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[IMS] Reserve error:", msg);
    return {
      success: false,
      error: "Inventory reservation failed. Please try again.",
    };
  }
}

/**
 * Release reserved inventory in IMS.
 * Call this when an order is cancelled or payment fails.
 */
export async function releaseInventory(
  orderId: string,
  items: ImsReservationItem[]
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getImsBaseUrl();
  if (!baseUrl) {
    console.warn("[IMS] IMS_BASE_URL not set; skipping release (dev mode)");
    return { success: true };
  }

  const payload: ImsReleaseRequest = { order_id: orderId, items };
  const url = `${baseUrl.replace(/\/$/, "")}/release`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({})) as ImsReservationResponse & { success?: boolean };
    console.log("[IMS] Release response:", res.status, JSON.stringify(body));

    if (!res.ok) {
      const errMsg =
        (body as { error?: string }).error ??
        (body as { message?: string }).message ??
        `IMS release failed: ${res.status}`;
      return { success: false, error: errMsg };
    }

    if (body.success === false) {
      return {
        success: false,
        error:
          (body as { error?: string }).error ??
          (body as { message?: string }).message ??
          "Inventory release failed",
      };
    }

    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[IMS] Release error:", msg);
    return {
      success: false,
      error: "Inventory release failed. Please try again.",
    };
  }
}
