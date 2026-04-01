/**
 * React Query hooks for products from ecommerce.products.
 * Products are fetched from the database on each request - new products
 * appear automatically when the user navigates or refetches.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  type Product,
  type ListProductsParams,
} from "@/lib/productsApi";

/** Query key factory */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ListProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => ["categories"] as const,
};

/** Fetch all products with optional filters. Refetches ensure new DB products appear. */
export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    staleTime: 60 * 1000, // 1 min - balance freshness with not hammering API
    refetchOnWindowFocus: true,
  });
}

/** Fetch a single product by ID */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(productId ?? ""),
    queryFn: () => fetchProductById(productId!),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

/** Fetch categories from ecommerce.categories */
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 min - categories change less often
  });
}

export type { Product, ListProductsParams };
