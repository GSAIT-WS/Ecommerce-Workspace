// Shared dummy product data for the entire app
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMultigrainSnack from "@/assets/product-multigrain-snack.jpg";
import productChikki from "@/assets/product-chikki.jpg";
import productCombo from "@/assets/product-combo.jpg";
import productMilletBar from "@/assets/product-millet-bar.jpg";
import productHealthyMix from "@/assets/product-healthy-mix.jpg";
import productShilajitBar from "@/assets/product-shilajit-bar.jpg";

export interface Product {
  id: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  category: string;
  protein?: string;
  calories?: number;
  dietType?: string;
  packType?: string;
}

export const allProducts: Product[] = [
  {
    id: "1",
    name: "Peanut Butter Protein Bar",
    tag: "High Protein",
    price: 149,
    originalPrice: 199,
    rating: 4.8,
    image: productProteinBar,
    category: "protein-bars",
    protein: "15g",
    calories: 180,
    dietType: "Vegetarian",
    packType: "Single",
  },
  {
    id: "2",
    name: "Multigrain Millet Crunch",
    tag: "Multigrain",
    price: 129,
    originalPrice: 179,
    rating: 4.6,
    image: productMultigrainSnack,
    category: "multigrain",
    protein: "8g",
    calories: 150,
    dietType: "Vegan",
    packType: "Single",
  },
  {
    id: "3",
    name: "Traditional Groundnut Chikki",
    tag: "No Sugar",
    price: 99,
    rating: 4.5,
    image: productChikki,
    category: "healthy-foods",
    protein: "6g",
    calories: 120,
    dietType: "Vegetarian",
    packType: "Single",
  },
  {
    id: "4",
    name: "Healthy Snack Combo Pack",
    tag: "Best Value",
    price: 449,
    originalPrice: 599,
    rating: 4.9,
    image: productCombo,
    category: "combos",
    protein: "12g avg",
    calories: 160,
    dietType: "Vegetarian",
    packType: "Combo",
  },
  {
    id: "5",
    name: "Ragi Millet Energy Bar",
    tag: "High Fiber",
    price: 139,
    rating: 4.7,
    image: productMilletBar,
    category: "multigrain",
    protein: "10g",
    calories: 140,
    dietType: "Vegan",
    packType: "Single",
  },
  {
    id: "6",
    name: "Mixed Nuts & Seeds Trail Mix",
    tag: "Healthy",
    price: 249,
    originalPrice: 299,
    rating: 4.4,
    image: productHealthyMix,
    category: "healthy-foods",
    protein: "12g",
    calories: 200,
    dietType: "Vegan",
    packType: "Single",
  },
  {
    id: "7",
    name: "Shilajit Power Bar",
    tag: "Energy Boost",
    price: 199,
    originalPrice: 249,
    rating: 4.8,
    image: productShilajitBar,
    category: "protein-bars",
    protein: "18g",
    calories: 190,
    dietType: "Vegetarian",
    packType: "Single",
  },
  {
    id: "8",
    name: "Quinoa Crunch Bites",
    tag: "Gluten Free",
    price: 179,
    rating: 4.6,
    image: productMultigrainSnack,
    category: "multigrain",
    protein: "9g",
    calories: 145,
    dietType: "Gluten-free",
    packType: "Single",
  },
  {
    id: "9",
    name: "Oats & Honey Bar",
    tag: "Breakfast",
    price: 119,
    originalPrice: 149,
    rating: 4.5,
    image: productProteinBar,
    category: "healthy-foods",
    protein: "7g",
    calories: 130,
    dietType: "Vegetarian",
    packType: "Single",
  },
  {
    id: "10",
    name: "Amaranth Ladoo",
    tag: "Traditional",
    price: 159,
    rating: 4.7,
    image: productChikki,
    category: "healthy-foods",
    protein: "5g",
    calories: 110,
    dietType: "Vegetarian",
    packType: "Single",
  },
  {
    id: "11",
    name: "Jowar Puffs",
    tag: "Light Snack",
    price: 89,
    rating: 4.3,
    image: productMilletBar,
    category: "multigrain",
    protein: "4g",
    calories: 90,
    dietType: "Vegan",
    packType: "Single",
  },
  {
    id: "12",
    name: "Super Seeds Mix",
    tag: "Omega Rich",
    price: 299,
    originalPrice: 349,
    rating: 4.8,
    image: productHealthyMix,
    category: "healthy-foods",
    protein: "14g",
    calories: 210,
    dietType: "Vegan",
    packType: "Bulk",
  },
  {
    id: "13",
    name: "Ultimate Energy Combo",
    tag: "Best Seller",
    price: 699,
    originalPrice: 899,
    rating: 4.9,
    image: productCombo,
    category: "combos",
    protein: "15g avg",
    calories: 175,
    dietType: "Vegetarian",
    packType: "Combo",
  },
  {
    id: "14",
    name: "Whey Protein Crunch Bar",
    tag: "High Protein",
    price: 169,
    originalPrice: 219,
    rating: 4.7,
    image: productShilajitBar,
    category: "protein-bars",
    protein: "20g",
    calories: 200,
    dietType: "Vegetarian",
    packType: "Single",
  },
];

export const categories = [
  { slug: "protein-bars", name: "Protein Bars", searchTerm: "protein" },
  { slug: "multigrain", name: "Multigrain Snacks", searchTerm: "multigrain" },
  { slug: "healthy-foods", name: "Healthy Foods", searchTerm: "healthy" },
  { slug: "combos", name: "Combos & Value Packs", searchTerm: "combo" },
];

// Search keywords mapping
export const searchKeywords: Record<string, string[]> = {
  protein: ["protein", "pro", "whey", "power", "energy"],
  multigrain: ["multigrain", "multi", "grain", "millet", "ragi", "jowar", "bajra"],
  healthy: ["healthy", "health", "natural", "organic", "nuts", "seeds", "trail"],
  combos: ["combo", "pack", "value", "bundle", "bulk"],
  "sugar-free": ["sugar", "sugarfree", "no sugar", "low sugar", "diabetic"],
  vegan: ["vegan", "plant", "dairy-free"],
  "gluten-free": ["gluten", "celiac"],
  breakfast: ["breakfast", "morning", "oats"],
  snacks: ["snack", "crunch", "bite", "puff"],
};

// Get products by category
export const getProductsByCategory = (categorySlug: string): Product[] => {
  return allProducts.filter((p) => p.category === categorySlug);
};

// Search products with partial matching
export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return allProducts;
  
  // Find matching category from keywords
  let matchedCategories: string[] = [];
  for (const [category, keywords] of Object.entries(searchKeywords)) {
    if (keywords.some(kw => lowerQuery.includes(kw) || kw.includes(lowerQuery))) {
      matchedCategories.push(category);
    }
  }
  
  // Filter products
  return allProducts.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(lowerQuery);
    const matchesTag = product.tag.toLowerCase().includes(lowerQuery);
    const matchesCategory = matchedCategories.includes(product.category);
    const matchesDiet = product.dietType?.toLowerCase().includes(lowerQuery);
    
    return matchesName || matchesTag || matchesCategory || matchesDiet;
  });
};

// Get popular products (for empty/no-match states)
export const getPopularProducts = (): Product[] => {
  return allProducts.filter((p) => p.rating >= 4.5).slice(0, 6);
};
