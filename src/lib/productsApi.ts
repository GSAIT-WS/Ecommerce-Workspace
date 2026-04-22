/**
 * Products API — Edge Functions call Postgres RPCs that read `ecommerce.products`
 * (with `ecommerce.categories` for `category_slug`). Apply migration `075_*` and
 * deploy `list-products` / `get-product-by-id` so the storefront receives DB rows.
 */

import { PRODUCT_IMAGE_PLACEHOLDER } from "./productImagePlaceholder";
import { supabase } from "./supabaseClient";

/** Raw product from list-products / get-product-by-id */
export interface ApiProduct {
  id: string;
  product_external_id: string | null;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  gallery_urls: string[];
  category_id: string | null;
  category_slug?: string | null;
  is_active: boolean;
  is_in_deletion_period: boolean;
  weight_grams: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/** Frontend Product shape (compatible with ProductCard, etc.) */
export interface Product {
  id: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  galleryImages?: string[];
  category: string;
  isActive: boolean;
  isInDeletionPeriod: boolean;
  protein?: string;
  calories?: number;
  dietType?: string;
  packType?: string;
}

export function mapApiProductToProduct(row: ApiProduct): Product {
  const tag = Array.isArray(row.tags) && row.tags.length > 0 ? row.tags[0] : "Product";
  const galleryImages = Array.isArray(row.gallery_urls)
    ? row.gallery_urls.filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];
  return {
    id: row.id,
    name: row.name,
    tag,
    price: row.price,
    originalPrice: row.compare_at_price ?? undefined,
    rating: 4.5,
    image: row.image_url || PRODUCT_IMAGE_PLACEHOLDER,
    galleryImages,
    category: row.category_slug || "",
    isActive: row.is_active,
    isInDeletionPeriod: row.is_in_deletion_period,
    protein: row.weight_grams != null ? `${Math.round(row.weight_grams / 10)}g` : undefined,
    calories: row.weight_grams ?? undefined,
    dietType: tag,
    packType: "Single",
  };
}

export interface ListProductsParams {
  category_id?: string;
  category_slug?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export interface ListProductsResponse {
  success?: boolean;
  data?: {
    items: ApiProduct[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
}

export interface GetProductResponse {
  success?: boolean;
  data?: ApiProduct;
  error?: string;
}

export interface ListCategoriesResponse {
  success?: boolean;
  data?: {
    items: Array<{
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      is_active: boolean;
      sort_order: number;
    }>;
  };
  error?: string;
}

let hasLoggedProductsConfigError = false;

function isInvalidEcommerceSchemaError(message: string): boolean {
  return message.includes("Invalid schema: ecommerce") || message.includes("PGRST106");
}

function isMissingPublicViewError(message: string): boolean {
  return (
    message.includes("Could not find the table 'public.ecommerce_products'") ||
    message.includes("Could not find the table 'public.ecommerce_categories'") ||
    message.includes("PGRST205")
  );
}

function logProductsConfigErrorOnce(message: string): void {
  if (hasLoggedProductsConfigError) return;
  hasLoggedProductsConfigError = true;
  console.error(message);
}

type DbProductRow = {
  id: string;
  product_external_id: string | null;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  category_id: string | null;
  is_active: boolean;
  is_in_deletion_period: boolean;
  weight_grams: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

function normalizeDbRow(row: DbProductRow, categorySlugById: Map<string, string>): ApiProduct {
  return {
    id: row.id,
    product_external_id: row.product_external_id,
    name: row.name,
    description: row.description,
    price: row.price,
    compare_at_price: row.compare_at_price,
    image_url: row.image_url,
    gallery_urls: row.gallery_urls ?? [],
    category_id: row.category_id,
    category_slug: row.category_id ? (categorySlugById.get(row.category_id) ?? null) : null,
    is_active: row.is_active,
    is_in_deletion_period: row.is_in_deletion_period,
    weight_grams: row.weight_grams,
    tags: row.tags ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function fetchCategorySlugMap(
  categoryIds: Array<string | null | undefined>
): Promise<Map<string, string>> {
  const uniqueIds = Array.from(new Set(categoryIds.filter((id): id is string => Boolean(id))));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await supabase
    .schema("ecommerce")
    .from("categories")
    .select("id, slug")
    .in("id", uniqueIds);

  if (error) {
    console.warn("[productsApi] categories lookup failed; continuing without slugs.", error.message);
    return new Map();
  }

  return new Map((data ?? []).map((row) => [row.id as string, (row.slug as string) ?? ""]));
}

async function resolveCategoryIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .schema("ecommerce")
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to resolve category");
  }

  return data?.id ?? null;
}

async function fetchProductsFromDatabase(
  params: ListProductsParams = {}
): Promise<{ items: Product[]; total: number }> {
  let resolvedCategoryId: string | undefined = params.category_id;
  if (!resolvedCategoryId && params.category_slug) {
    const fromSlug = await resolveCategoryIdBySlug(params.category_slug);
    if (!fromSlug) {
      return { items: [], total: 0 };
    }
    resolvedCategoryId = fromSlug;
  }

  const limit = params.limit ?? 100;
  const offset = params.offset ?? 0;
  const rangeEnd = offset + Math.max(limit - 1, 0);

  let query = supabase
    .schema("ecommerce")
    .from("products")
    .select(
      "id, product_external_id, name, description, price, compare_at_price, image_url, gallery_urls, category_id, is_active, is_in_deletion_period, weight_grams, tags, created_at, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(offset, rangeEnd);

  if (resolvedCategoryId) query = query.eq("category_id", resolvedCategoryId);
  if (params.min_price != null) query = query.gte("price", params.min_price);
  if (params.max_price != null) query = query.lte("price", params.max_price);
  if (params.search) {
    const search = params.search.replace(/[%_]/g, "");
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message || "Failed to fetch products from database");
  }

  const rows = (data ?? []) as DbProductRow[];
  const categorySlugById = await fetchCategorySlugMap(rows.map((row) => row.category_id));
  const items = rows.map((row) => mapApiProductToProduct(normalizeDbRow(row, categorySlugById)));
  return { items, total: count ?? items.length };
}

async function fetchProductsFromPublicView(
  params: ListProductsParams = {}
): Promise<{ items: Product[]; total: number }> {
  const limit = params.limit ?? 100;
  const offset = params.offset ?? 0;
  const rangeEnd = offset + Math.max(limit - 1, 0);

  let query = supabase
    .from("ecommerce_products")
    .select(
      "id, product_external_id, name, description, price, compare_at_price, image_url, gallery_urls, category_id, category_slug, is_active, is_in_deletion_period, weight_grams, tags, created_at, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(offset, rangeEnd);

  if (params.category_id) query = query.eq("category_id", params.category_id);
  if (params.category_slug) query = query.eq("category_slug", params.category_slug);
  if (params.min_price != null) query = query.gte("price", params.min_price);
  if (params.max_price != null) query = query.lte("price", params.max_price);
  if (params.search) {
    const search = params.search.replace(/[%_]/g, "");
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message || "Failed to fetch products");
  }

  const items = (data ?? []).map((row) => mapApiProductToProduct(row as ApiProduct));
  return { items, total: count ?? items.length };
}

async function fetchProductByIdFromPublicView(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("ecommerce_products")
    .select(
      "id, product_external_id, name, description, price, compare_at_price, image_url, gallery_urls, category_id, category_slug, is_active, is_in_deletion_period, weight_grams, tags, created_at, updated_at"
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message || "Failed to fetch product");
  if (!data) return null;
  return mapApiProductToProduct(data as ApiProduct);
}

export async function fetchProducts(
  params: ListProductsParams = {}
): Promise<{ items: Product[]; total: number }> {
  try {
    return await fetchProductsFromDatabase(params);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch products";
    if (isInvalidEcommerceSchemaError(message) || isMissingPublicViewError(message)) {
      try {
        return await fetchProductsFromPublicView(params);
      } catch (viewErr) {
        const viewMessage = viewErr instanceof Error ? viewErr.message : "Failed to fetch products";
        if (isMissingPublicViewError(viewMessage)) {
          logProductsConfigErrorOnce(
            "[productsApi] Products are unavailable: ecommerce schema is not exposed in PostgREST and public.ecommerce_products view is missing. Please apply ecommerce public views migration."
          );
          return { items: [], total: 0 };
        }
        throw viewErr;
      }
    }
    throw e;
  }
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const { data: dbRow, error: dbError } = await supabase
      .schema("ecommerce")
      .from("products")
      .select(
        "id, product_external_id, name, description, price, compare_at_price, image_url, gallery_urls, category_id, is_active, is_in_deletion_period, weight_grams, tags, created_at, updated_at"
      )
      .eq("id", productId)
      .maybeSingle();

    if (dbError) throw new Error(dbError.message || "Failed to fetch product");
    if (!dbRow) return null;
    const categorySlugById = await fetchCategorySlugMap([(dbRow as DbProductRow).category_id]);
    return mapApiProductToProduct(normalizeDbRow(dbRow as DbProductRow, categorySlugById));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch product";
    if (isInvalidEcommerceSchemaError(message) || isMissingPublicViewError(message)) {
      try {
        return await fetchProductByIdFromPublicView(productId);
      } catch (viewErr) {
        const viewMessage = viewErr instanceof Error ? viewErr.message : "Failed to fetch product";
        if (isMissingPublicViewError(viewMessage)) {
          logProductsConfigErrorOnce(
            "[productsApi] Product details are unavailable: ecommerce schema is not exposed in PostgREST and public.ecommerce_products view is missing."
          );
          return null;
        }
        throw viewErr;
      }
    }
    throw e;
  }
}

export async function fetchCategories(): Promise<
  Array<{ id: string; name: string; slug: string; image_url: string | null }>
> {
  const path = "/list-categories";
  const { data, error } = await apiCall<ListCategoriesResponse>(path, { method: "GET" });

  if (error || !data?.success) {
    throw new Error((data as { error?: string })?.error || error || "Failed to fetch categories");
  }

  const inner = (data as { data?: { items: Array<{ id: string; name: string; slug: string; image_url: string | null }> } })
    .data;
  return inner?.items ?? [];
}
