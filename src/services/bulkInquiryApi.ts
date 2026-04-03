import { apiCall, hasApiConfig } from "@/lib/api";

export interface BulkInquiryPayload {
  product_id: string;
  product_name: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  quantity: string;
  message: string;
}

export function openBulkInquiryMailto(payload: BulkInquiryPayload): void {
  const subject = `Bulk quote: ${payload.product_name}`;
  const body = [
    `Product: ${payload.product_name} (ID: ${payload.product_id})`,
    `Name: ${payload.name}`,
    `Business: ${payload.business}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Quantity: ${payload.quantity}`,
    payload.message.trim() ? `Notes:\n${payload.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  window.location.href = `mailto:hello@crunchx.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

type SubmitResult =
  | { ok: true; viaEmail?: boolean }
  | { ok: false; error: string };

export async function submitBulkInquiry(payload: BulkInquiryPayload): Promise<SubmitResult> {
  if (!hasApiConfig()) {
    openBulkInquiryMailto(payload);
    return { ok: true, viaEmail: true };
  }

  const { data, error } = await apiCall<{
    success?: boolean;
    data?: { id?: string };
    error?: string;
  }>("/submit-bulk-inquiry", { method: "POST", body: payload });

  if (error) {
    if (
      error.includes("not configured") ||
      error.toLowerCase().includes("contact support")
    ) {
      openBulkInquiryMailto(payload);
      return { ok: true, viaEmail: true };
    }
    return { ok: false, error };
  }

  if (!data?.success || !data?.data?.id) {
    return { ok: false, error: data?.error || "Could not submit inquiry" };
  }

  return { ok: true };
}
