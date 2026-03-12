import { apiCall } from "@/lib/api";

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

export async function addAddress(
  data: AddressFormData,
  token?: string | null
): Promise<{ addressId?: string; error?: string }> {
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

  const result = await apiCall<{ address_id?: string }>("/add-address", {
    method: "POST",
    body,
    token,
  });

  if (result.error) {
    return { error: result.error };
  }
  const addressId = (result.data as { address_id?: string })?.address_id;
  return addressId ? { addressId } : { error: "Invalid response" };
}
