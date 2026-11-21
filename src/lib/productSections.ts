import type { Product } from "./productsApi";
import { PRODUCT_IMAGE_PLACEHOLDER } from "./productImagePlaceholder";

export type ProductSectionId = "singles" | "combos" | "jars";

export type ProductSort =
  | "Relevance"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Rating"
  | "Newest";

export interface ProductSection {
  id: ProductSectionId;
  eyebrow: string;
  title: string;
  description: string;
  badgeLabel: string;
  products: Product[];
}

const SECTION_ORDER: ProductSectionId[] = ["singles", "combos", "jars"];

const SECTION_DETAILS: Record<
  ProductSectionId,
  Pick<ProductSection, "eyebrow" | "title" | "description" | "badgeLabel">
> = {
  singles: {
    eyebrow: "Everyday",
    title: "Single Pieces",
    description: "Jowar, kurmura and sesame peanut chikki, sold individually.",
    badgeLabel: "Single",
  },
  combos: {
    eyebrow: "Assortments",
    title: "Combos",
    description: "Discovery, variety and family sharing packs.",
    badgeLabel: "Combo",
  },
  jars: {
    eyebrow: "Stock up",
    title: "Jars",
    description: "Jowar, kurmura and sesame peanut chikki jars.",
    badgeLabel: "Jar",
  },
};

const FLAVOUR_PATTERNS = [/jowar/i, /kurmura/i, /sesame/i];

function normalizedName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function hasRealImage(product: Product): boolean {
  return Boolean(product.image) && product.image !== PRODUCT_IMAGE_PLACEHOLDER;
}

function getFlavourRank(name: string): number {
  const index = FLAVOUR_PATTERNS.findIndex((pattern) => pattern.test(name));
  return index === -1 ? FLAVOUR_PATTERNS.length : index;
}

function defaultCompare(section: ProductSectionId, a: Product, b: Product): number {
  if (section === "combos") {
    return a.price - b.price || a.name.localeCompare(b.name);
  }

  return (
    getFlavourRank(a.name) - getFlavourRank(b.name) ||
    a.price - b.price ||
    a.name.localeCompare(b.name)
  );
}

function compareProducts(
  section: ProductSectionId,
  sort: ProductSort,
  a: Product,
  b: Product,
): number {
  switch (sort) {
    case "Price: Low to High":
      return a.price - b.price || defaultCompare(section, a, b);
    case "Price: High to Low":
      return b.price - a.price || defaultCompare(section, a, b);
    case "Rating":
      return b.rating - a.rating || defaultCompare(section, a, b);
    case "Newest":
      return 0;
    default:
      return defaultCompare(section, a, b);
  }
}

export function getProductSectionId(name: string): ProductSectionId {
  const key = name.toLowerCase();

  if (/\bjars?\b/.test(key)) return "jars";
  if (/\b(combo|combos|pack|packs|discovery|variety|family|sharing)\b/.test(key)) {
    return "combos";
  }
  return "singles";
}

/**
 * Hide duplicate storefront records that share the same name and price.
 * Prefer the entry with a real image so production cards do not show a
 * placeholder when an otherwise identical record has usable media.
 */
export function dedupeProducts(products: Product[]): Product[] {
  const byKey = new Map<string, Product>();

  for (const product of products) {
    const key = `${normalizedName(product.name)}::${product.price}`;
    const existing = byKey.get(key);
    if (!existing || (!hasRealImage(existing) && hasRealImage(product))) {
      byKey.set(key, product);
    }
  }

  return Array.from(byKey.values());
}

/** Group the catalogue into the storefront's three shoppable formats. */
export function buildProductSections(
  products: Product[],
  sort: ProductSort = "Relevance",
): ProductSection[] {
  const grouped: Record<ProductSectionId, Product[]> = {
    singles: [],
    combos: [],
    jars: [],
  };

  for (const product of dedupeProducts(products)) {
    grouped[getProductSectionId(product.name)].push(product);
  }

  return SECTION_ORDER.map((id) => ({
    id,
    ...SECTION_DETAILS[id],
    products: grouped[id].sort((a, b) => compareProducts(id, sort, a, b)),
  })).filter((section) => section.products.length > 0);
}
