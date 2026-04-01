/**
 * Address validation service — no Supabase, pure validation.
 */

import type { AddAddressParams, UpdateAddressParams } from "./types.ts";
import { isValidUuid } from "../validation.ts";

const PHONE_REGEX = /^\d{10}$/;
const POSTAL_CODE_REGEX = /^\d{6}$/;

const UPDATABLE_FIELDS = [
  "label", "recipient_name", "phone", "address_line1",
  "address_line2", "city", "state", "postal_code", "country",
  "latitude", "longitude",
] as const;

export function validateAddAddressParams(body: unknown): {
  valid: true;
  params: AddAddressParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;

  if (!o.recipient_name || typeof o.recipient_name !== "string" || o.recipient_name.trim().length < 2) {
    return { valid: false, error: "recipient_name is required (min 2 chars)" };
  }
  if (!o.phone || typeof o.phone !== "string" || !PHONE_REGEX.test(String(o.phone).replace(/\D/g, "").slice(-10))) {
    return { valid: false, error: "phone must be a 10-digit number" };
  }
  if (!o.address_line1 || typeof o.address_line1 !== "string" || o.address_line1.trim().length < 3) {
    return { valid: false, error: "address_line1 is required (min 3 chars)" };
  }
  if (!o.city || typeof o.city !== "string") {
    return { valid: false, error: "city is required" };
  }
  if (!o.state || typeof o.state !== "string") {
    return { valid: false, error: "state is required" };
  }
  if (!o.postal_code || typeof o.postal_code !== "string" || !POSTAL_CODE_REGEX.test(o.postal_code as string)) {
    return { valid: false, error: "postal_code must be a 6-digit pincode" };
  }

  const lat = o.latitude;
  const lng = o.longitude;
  const latitude = lat != null && typeof lat === "number" && !Number.isNaN(lat) ? lat : undefined;
  const longitude = lng != null && typeof lng === "number" && !Number.isNaN(lng) ? lng : undefined;

  return {
    valid: true,
    params: {
      recipient_name: (o.recipient_name as string).trim(),
      phone: (o.phone as string).trim(),
      address_line1: (o.address_line1 as string).trim(),
      address_line2: o.address_line2 ? (o.address_line2 as string).trim() : undefined,
      city: (o.city as string).trim(),
      state: (o.state as string).trim(),
      postal_code: (o.postal_code as string).trim(),
      country: (o.country as string) || "IN",
      label: (o.label as string) || "Home",
      is_default: !!o.is_default,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    },
  };
}

export function validateUpdateAddressParams(body: unknown): {
  valid: true;
  params: UpdateAddressParams;
} | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }
  const o = body as Record<string, unknown>;

  if (!o.address_id || !isValidUuid(o.address_id)) {
    return { valid: false, error: "address_id (valid UUID) is required" };
  }

  const hasUpdatableField = UPDATABLE_FIELDS.some(
    (f) => o[f] !== undefined && o[f] !== null,
  );
  if (!hasUpdatableField) {
    return { valid: false, error: `At least one field to update is required: ${UPDATABLE_FIELDS.join(", ")}` };
  }

  if (o.phone && typeof o.phone === "string" && !PHONE_REGEX.test(String(o.phone).replace(/\D/g, "").slice(-10))) {
    return { valid: false, error: "phone must be a 10-digit number" };
  }
  if (o.postal_code && typeof o.postal_code === "string" && !POSTAL_CODE_REGEX.test(o.postal_code as string)) {
    return { valid: false, error: "postal_code must be a 6-digit pincode" };
  }

  const lat = o.latitude;
  const lng = o.longitude;
  const latitude = lat != null && typeof lat === "number" && !Number.isNaN(lat) ? lat : undefined;
  const longitude = lng != null && typeof lng === "number" && !Number.isNaN(lng) ? lng : undefined;

  return {
    valid: true,
    params: {
      address_id: o.address_id as string,
      label: o.label != null ? (o.label as string) : undefined,
      recipient_name: o.recipient_name ? (o.recipient_name as string).trim() : undefined,
      phone: o.phone ? (o.phone as string).trim() : undefined,
      address_line1: o.address_line1 ? (o.address_line1 as string).trim() : undefined,
      address_line2: o.address_line2 !== undefined ? (o.address_line2 ? (o.address_line2 as string).trim() : "") : undefined,
      city: o.city ? (o.city as string).trim() : undefined,
      state: o.state ? (o.state as string).trim() : undefined,
      postal_code: o.postal_code ? (o.postal_code as string).trim() : undefined,
      country: o.country ? (o.country as string) : undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
    },
  };
}
