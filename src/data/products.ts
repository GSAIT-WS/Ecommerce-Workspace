/**
 * Product types and search keywords.
 * Product data is fetched from ecommerce.products via API (see lib/productsApi.ts).
 */

import type { Product } from "@/lib/productsApi";

export type { Product };

// Search keywords mapping (for client-side tag/diet filtering)
export const searchKeywords: Record<string, string[]> = {
  protein: ["protein", "pro", "whey", "power", "energy"],
  multigrain: ["multigrain", "multi", "grain", "millet", "ragi", "jowar", "bajra"],
  healthy: ["healthy", "health", "natural", "organic", "nuts", "seeds", "trail"],
  "sugar-free": ["sugar", "sugarfree", "no sugar", "low sugar", "diabetic"],
  vegan: ["vegan", "plant", "dairy-free"],
  "gluten-free": ["gluten", "celiac"],
  breakfast: ["breakfast", "morning", "oats"],
  snacks: ["snack", "crunch", "bite", "puff"],
};
