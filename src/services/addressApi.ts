/**
 * Customer shipping addresses (authenticated flows).
 *
 * All server-side writes go to **`ecommerce.addresses`** via Supabase Edge Functions,
 * which call `ecommerce.add_customer_address`, `ecommerce.update_customer_address`, etc.
 * (see `supabase/functions/add-address`, `update-address`, …).
 */
import { apiCall, unwrapEdgeData } from "@/lib/api";

export interface AddressFormData {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  label?: string;
  is_default?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AddAddressResponse {
  address_id: string;
}

/** Address from get-my-addresses API (or guest localStorage) */
export interface ApiAddress {
  id: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  label?: string;
  is_default?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

// ─── Guest address storage (localStorage) ───────────────────────────────────

const GUEST_ADDRESSES_KEY = "crunchx_guest_addresses";

export function loadGuestAddresses(): ApiAddress[] {
  try {
    const raw = localStorage.getItem(GUEST_ADDRESSES_KEY);
    return raw ? (JSON.parse(raw) as ApiAddress[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestAddress(address: ApiAddress): void {
  try {
    const existing = loadGuestAddresses();
    // Replace if same id, else prepend (capped at 5)
    const updated = [
      address,
      ...existing.filter((a) => a.id !== address.id),
    ].slice(0, 5);
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(updated));
    console.log("[CrunchX] Guest address saved to localStorage:", address.id);
  } catch {
    console.warn("[CrunchX] Could not save guest address to localStorage");
  }
}

export function removeGuestAddress(id: string): void {
  try {
    const updated = loadGuestAddresses().filter((a) => a.id !== id);
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearGuestAddresses(): void {
  try {
    localStorage.removeItem(GUEST_ADDRESSES_KEY);
  } catch {
    // ignore
  }
}

export function isGuestAddressId(id: string): boolean {
  // "guest-*"  → unauthenticated user saved locally
  // "local-*"  → authenticated user saved locally as API fallback
  return id.startsWith("guest-") || id.startsWith("local-");
}

// ─── Authenticated API calls ─────────────────────────────────────────────────

export async function addAddress(
  data: AddressFormData,
  token?: string | null
): Promise<{ addressId?: string; error?: string }> {
  if (!token) {
    // No auth — save locally and surface a clear signal to the caller
    const guestAddress: ApiAddress = {
      id: `guest-${Date.now()}`,
      recipient_name: data.recipient_name,
      phone: data.phone.replace(/\D/g, "").slice(-10),
      address_line1: data.address_line1,
      address_line2: data.address_line2 || null,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      label: data.label || "Home",
      is_default: true,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    };
    saveGuestAddress(guestAddress);
    return { addressId: guestAddress.id };
  }

  const body = {
    recipient_name: data.recipient_name,
    phone: data.phone.replace(/\D/g, "").slice(-10),
    address_line1: data.address_line1,
    address_line2: data.address_line2 || undefined,
    city: data.city,
    state: data.state,
    postal_code: data.postal_code,
    country: data.country || "IN",
    label: data.label || "Home",
    is_default: !!data.is_default,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
  };

  console.log("[CrunchX] addAddress: sending POST /add-address", {
    recipient_name: body.recipient_name,
    city: body.city,
    postal_code: body.postal_code,
  });

  const result = await apiCall("/add-address", { method: "POST", body, token });

  console.log("[CrunchX] addAddress: response →", { status: result.status, error: result.error, data: result.data });

  if (result.error) {
    // API failed — fall back to localStorage so the UI keeps working
    console.warn("[CrunchX] addAddress: API error, saving to localStorage as fallback:", result.error);
    const fallback: ApiAddress = {
      id: `local-${Date.now()}`,
      recipient_name: body.recipient_name as string,
      phone: body.phone as string,
      address_line1: body.address_line1 as string,
      address_line2: (body.address_line2 as string | undefined) ?? null,
      city: body.city as string,
      state: body.state as string,
      postal_code: body.postal_code as string,
      label: (body.label as string) || "Home",
      is_default: !!body.is_default,
      latitude: (body.latitude as number | null) ?? null,
      longitude: (body.longitude as number | null) ?? null,
    };
    saveGuestAddress(fallback);
    // Propagate a friendly error so callers can show a softer message
    return { addressId: fallback.id, error: result.error };
  }

  const parsed = unwrapEdgeData<{ address_id: string }>(result.data);
  if (parsed.ok === false) {
    console.warn("[CrunchX] addAddress: unexpected response shape", result.data);
    return { error: parsed.error };
  }
  const addressId = parsed.data.address_id;
  if (!addressId) {
    return { error: "Invalid response from server" };
  }
  return { addressId };
}

export async function updateAddress(
  addressId: string,
  data: Partial<AddressFormData>,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const body: Record<string, unknown> = { address_id: addressId };
  if (data.recipient_name !== undefined) body.recipient_name = data.recipient_name;
  if (data.phone !== undefined) body.phone = data.phone.replace(/\D/g, "").slice(-10);
  if (data.address_line1 !== undefined) body.address_line1 = data.address_line1;
  if (data.address_line2 !== undefined) body.address_line2 = data.address_line2;
  if (data.city !== undefined) body.city = data.city;
  if (data.state !== undefined) body.state = data.state;
  if (data.postal_code !== undefined) body.postal_code = data.postal_code;
  if (data.country !== undefined) body.country = data.country;
  if (data.label !== undefined) body.label = data.label;
  if (data.latitude !== undefined) body.latitude = data.latitude;
  if (data.longitude !== undefined) body.longitude = data.longitude;

  const result = await apiCall("/update-address", { method: "POST", body, token });
  if (result.error) return { success: false, error: result.error };
  const parsed = unwrapEdgeData<{ address_id?: string }>(result.data);
  if (parsed.ok === false) return { success: false, error: parsed.error };
  return { success: true };
}

export async function deleteAddress(
  addressId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  // Handle locally-stored guest addresses without touching the API
  if (isGuestAddressId(addressId)) {
    removeGuestAddress(addressId);
    return { success: true };
  }

  const result = await apiCall("/delete-address", {
    method: "POST",
    body: { address_id: addressId },
    token,
  });
  if (result.error) return { success: false, error: result.error };
  const parsed = unwrapEdgeData(result.data);
  if (parsed.ok === false) return { success: false, error: parsed.error };
  return { success: true };
}

export async function setDefaultAddress(
  addressId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  // For guest addresses: mark as default in localStorage
  if (isGuestAddressId(addressId)) {
    const addrs = loadGuestAddresses().map((a) => ({
      ...a,
      is_default: a.id === addressId,
    }));
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(addrs));
    return { success: true };
  }

  const result = await apiCall("/set-default-address", {
    method: "POST",
    body: { address_id: addressId },
    token,
  });
  if (result.error) return { success: false, error: result.error };
  const parsed = unwrapEdgeData(result.data);
  if (parsed.ok === false) return { success: false, error: parsed.error };
  return { success: true };
}

export async function getMyAddresses(
  token?: string | null
): Promise<{ addresses?: ApiAddress[]; error?: string }> {
  // No auth token — return locally stored guest addresses without any API call
  if (!token) {
    console.log("[CrunchX] getMyAddresses: no token — returning guest addresses from localStorage");
    return { addresses: loadGuestAddresses() };
  }

  const result = await apiCall("/get-my-addresses", { method: "POST", body: {}, token });
  if (result.error) return { error: result.error };
  const parsed = unwrapEdgeData<{ addresses?: ApiAddress[] }>(result.data);
  if (parsed.ok === false) return { error: parsed.error };
  return { addresses: parsed.data.addresses ?? [] };
}
