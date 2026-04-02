export interface BulkInquiryFormInput {
  name: string;
  business: string;
  phone: string;
  email: string;
  quantity: string;
  message: string;
}

/** Returns an error message string, or null if valid. */
export function validateBulkInquiryForm(form: BulkInquiryFormInput): string | null {
  if (!form.name?.trim()) return "Please enter your name.";
  if (!form.business?.trim()) return "Please enter your business or organization.";
  const phoneDigits = form.phone?.replace(/\D/g, "") ?? "";
  if (phoneDigits.length < 10) return "Please enter a valid phone number.";
  if (!/\S+@\S+\.\S+/.test(form.email?.trim() ?? "")) return "Please enter a valid email.";
  const qty = parseInt(form.quantity?.trim() ?? "", 10);
  if (Number.isNaN(qty) || qty < 1) return "Please enter a valid quantity.";
  if (!form.message?.trim()) return "Please add a short message.";
  return null;
}
