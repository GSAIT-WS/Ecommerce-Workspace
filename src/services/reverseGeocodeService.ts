/**
 * Reverse Geocoding Service
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * Usage policy: max 1 request/second, provide User-Agent
 */

export interface GeocodedAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  displayAddress: string;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "CrunchX-Ecommerce/1.0 (Delivery Address Selection)";

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // Slightly over 1 req/sec for Nominatim policy

function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    return new Promise((resolve) =>
      setTimeout(resolve, MIN_INTERVAL_MS - elapsed)
    );
  }
  lastRequestTime = Date.now();
  return Promise.resolve();
}

function parseNominatimAddress(addr: Record<string, string>): GeocodedAddress {
  const road = addr.road || addr.street || addr.footway || "";
  const houseNumber = addr.house_number || "";
  const suburb = addr.suburb || addr.neighbourhood || addr.village || "";
  const line1 = [houseNumber, road].filter(Boolean).join(" ").trim() || suburb || addr.address29 || "Address";
  const line2 = suburb && line1 !== suburb ? suburb : undefined;
  const city = addr.city || addr.town || addr.municipality || addr.county || addr.state || "";
  const state = addr.state || addr.county || "";
  const pincode = addr.postcode || "";
  const country = addr.country || "India";

  const parts = [line1, line2, city, state, pincode, country].filter(Boolean);
  const displayAddress = parts.join(", ");

  return {
    line1: line1 || "Address",
    line2,
    city: city || "City",
    state: state || "State",
    pincode: pincode || "",
    country,
    displayAddress,
  };
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  await throttle();

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
    "accept-language": "en",
  });

  const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Reverse geocoding failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    address?: Record<string, string>;
    display_name?: string;
  };

  if (!data?.address) {
    return {
      line1: "Address",
      city: "City",
      state: "State",
      pincode: "",
      country: "India",
      displayAddress: data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }

  return parseNominatimAddress(data.address);
}

const SEARCH_BASE = "https://nominatim.openstreetmap.org/search";

/** Forward geocode: search for a place and return first result with lat/lng */
export async function searchPlace(
  query: string
): Promise<{ latitude: number; longitude: number; address: GeocodedAddress } | null> {
  if (!query.trim()) return null;
  await throttle();

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    addressdetails: "1",
    limit: "1",
    "accept-language": "en",
  });

  const res = await fetch(`${SEARCH_BASE}?${params}`, {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const results = (await res.json()) as Array<{
    lat?: string;
    lon?: string;
    address?: Record<string, string>;
    display_name?: string;
  }>;

  const first = results[0];
  if (!first?.lat || !first?.lon) return null;

  const lat = parseFloat(first.lat);
  const lng = parseFloat(first.lon);
  const addr = first.address
    ? parseNominatimAddress(first.address)
    : {
        line1: first.display_name || "Address",
        city: "City",
        state: "State",
        pincode: "",
        country: "India",
        displayAddress: first.display_name || `${lat}, ${lng}`,
      };

  return { latitude: lat, longitude: lng, address: addr };
}
