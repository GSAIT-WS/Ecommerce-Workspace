/**
 * Normalize user-entered phone to E.164 for India (+91) when a local 10-digit number is given.
 */
export function normalizePhoneToE164(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (input.trim().startsWith("+")) {
    return `+${digits}`;
  }
  return digits.length > 10 ? `+${digits}` : `+91${digits.slice(-10)}`;
}
