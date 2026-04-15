/**
 * Products API — Edge Functions call Postgres RPCs that read `ecommerce.products`
 * (with `ecommerce.categories` for `category_slug`). Apply migration `075_*` and
 * deploy `list-products` / `get-product-by-id` so the storefront receives DB rows.
 */

import { apiCall } from "./api";
import { PRODUCT_IMAGE_PLACEHOLDER } from "./productImagePlaceholder";

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

export async function fetchProducts(
  params: ListProductsParams = {}
): Promise<{ items: Product[]; total: number }> {
  const path = "/list-products";
  const body: Record<string, unknown> = {
    limit: params.limit ?? 100,
    offset: params.offset ?? 0,
  };
  if (params.category_id) body.category_id = params.category_id;
  if (params.category_slug) body.category_slug = params.category_slug;
  if (params.search) body.search = params.search;
  if (params.min_price != null) body.min_price = params.min_price;
  if (params.max_price != null) body.max_price = params.max_price;

  const { data, error } = await apiCall<ListProductsResponse>(path, {
    method: "POST",
    body,
  });

  if (error || !data?.success) {
    throw new Error((data as { error?: string })?.error || error || "Failed to fetch products");
  }

  const inner = (data as { data?: { items: ApiProduct[]; total: number } }).data;
  const items = (inner?.items ?? []).map(mapApiProductToProduct);
  const total = inner?.total ?? items.length;

  return { items, total };
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  const path = `/get-product-by-id?product_id=${encodeURIComponent(productId)}`;
  const { data, error } = await apiCall<GetProductResponse>(path, { method: "GET" });

  if (error || !data?.success) {
    if ((data as { error?: string })?.error === "Product not found") return null;
    throw new Error((data as { error?: string })?.error || error || "Failed to fetch product");
  }

  const inner = (data as { data?: ApiProduct }).data;
  if (!inner) return null;

  return mapApiProductToProduct(inner);
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
