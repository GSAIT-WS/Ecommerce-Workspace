/**
 * Category service layer — validation only (no Supabase).
 * list-categories has no required params; validation is minimal.
 */

export function validateListCategoriesParams(_body: unknown): { valid: true } | { valid: false; error: string } {
  return { valid: true };
}
