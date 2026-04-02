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

export type BulkInquiryResult =
  | { ok: true; viaEmail?: boolean }
  | { ok: false; error: string };

/**
 * Submits bulk inquiry. If no backend endpoint is configured, falls back to mailto.
 */
export async function submitBulkInquiry(payload: BulkInquiryPayload): Promise<BulkInquiryResult> {
  const subject = encodeURIComponent(`Bulk inquiry: ${payload.product_name}`);
  const body = encodeURIComponent(
    [
      `Product: ${payload.product_name} (${payload.product_id})`,
      `Name: ${payload.name}`,
      `Business: ${payload.business}`,
      `Phone: ${payload.phone}`,
      `Email: ${payload.email}`,
      `Quantity: ${payload.quantity}`,
      "",
      payload.message,
    ].join("\n")
  );
  try {
    window.open(`mailto:support@crunchx.com?subject=${subject}&body=${body}`, "_blank");
    return { ok: true, viaEmail: true };
  } catch {
    return { ok: false, error: "Could not open email. Please contact support." };
  }
}
