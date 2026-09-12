/**
 * Storefront product reads from ecommerce.products via direct Postgres.
 * Bypasses PostgREST schema exposure (ecommerce is often not in API settings).
 */

import { withDb } from "./db.ts";

type PgClient = Awaited<ReturnType<import("https://deno.land/x/postgres@v0.19.3/mod.ts").Pool["connect"]>>;

let cachedCategorySlugColumn: string | null = null;

async function resolveCategorySlugColumn(client: PgClient): Promise<string> {
  if (cachedCategorySlugColumn) return cachedCategorySlugColumn;

  const result = await client.queryObject<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'ecommerce'
       AND table_name = 'categories'
       AND column_name IN ('source_slug', 'slug')
     ORDER BY CASE column_name WHEN 'source_slug' THEN 0 ELSE 1 END
     LIMIT 1`
  );

  cachedCategorySlugColumn = result.rows[0]?.column_name ?? "source_slug";
  return cachedCategorySlugColumn;
}

export interface StoreProductRow {
  id: string;
  product_external_id: string | null;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  gallery_urls: string[];
  category_id: string | null;
  category_slug: string | null;
  is_active: boolean;
  is_in_deletion_period: boolean;
  weight_grams: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ListStoreProductsParams {
  category_id?: string | null;
  category_slug?: string | null;
  search?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  limit?: number;
  offset?: number;
}

function mapRow(row: Record<string, unknown>): StoreProductRow {
  return {
    id: String(row.id),
    product_external_id: row.product_external_id != null ? String(row.product_external_id) : null,
    name: String(row.name),
    description: row.description != null ? String(row.description) : null,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    image_url: row.image_url != null ? String(row.image_url) : null,
    gallery_urls: Array.isArray(row.gallery_urls)
      ? (row.gallery_urls as unknown[]).map(String)
      : [],
    category_id: row.category_id != null ? String(row.category_id) : null,
    category_slug: row.category_slug != null ? String(row.category_slug) : null,
    is_active: Boolean(row.is_active),
    is_in_deletion_period: Boolean(row.is_in_deletion_period),
    weight_grams: row.weight_grams != null ? Number(row.weight_grams) : null,
    tags: Array.isArray(row.tags) ? (row.tags as unknown[]).map(String) : [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function buildListFilters(
  params: ListStoreProductsParams,
  categorySlugColumn: string
): {
  conditions: string[];
  values: unknown[];
} {
  const conditions = [
    "p.is_active = true",
    "COALESCE(p.is_in_deletion_period, false) = false",
  ];
  const values: unknown[] = [];

  if (params.category_id) {
    values.push(params.category_id);
    conditions.push(`p.category_id = $${values.length}`);
  } else if (params.category_slug?.trim()) {
    values.push(params.category_slug.trim());
    conditions.push(`c.${categorySlugColumn} = $${values.length}`);
  }

  if (params.search?.trim()) {
    values.push(`%${params.search.trim().replace(/[%_\\]/g, "")}%`);
    conditions.push(`p.name ILIKE $${values.length}`);
  }

  if (params.min_price != null) {
    values.push(params.min_price);
    conditions.push(`p.price >= $${values.length}`);
  }

  if (params.max_price != null) {
    values.push(params.max_price);
    conditions.push(`p.price <= $${values.length}`);
  }

  return { conditions, values };
}

function productSelectSql(categorySlugColumn: string): string {
  return `
  SELECT
    p.id,
    p.product_external_id,
    p.name,
    p.description,
    p.price,
    p.compare_at_price,
    p.image_url,
    COALESCE(p.gallery_urls, '{}'::text[]) AS gallery_urls,
    p.category_id,
    c.${categorySlugColumn} AS category_slug,
    p.is_active,
    COALESCE(p.is_in_deletion_period, false) AS is_in_deletion_period,
    p.weight_grams,
    COALESCE(p.tags, '{}'::text[]) AS tags,
    p.created_at,
    p.updated_at
  FROM ecommerce.products p
  LEFT JOIN ecommerce.categories c ON c.id = p.category_id`;
}

export async function listStoreProducts(
  params: ListStoreProductsParams = {}
): Promise<{ items: StoreProductRow[]; total: number }> {
  const limit = Math.min(Math.max(params.limit ?? 100, 1), 100);
  const offset = Math.max(params.offset ?? 0, 0);

  return withDb(async (client) => {
    const categorySlugColumn = await resolveCategorySlugColumn(client);
    const { conditions, values } = buildListFilters(params, categorySlugColumn);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await client.queryObject<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM ecommerce.products p
       LEFT JOIN ecommerce.categories c ON c.id = p.category_id
       ${where}`,
      values
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    const listValues = [...values, limit, offset];
    const limitParam = listValues.length - 1;
    const offsetParam = listValues.length;

    const result = await client.queryObject<Record<string, unknown>>(
      `${productSelectSql(categorySlugColumn)}
       ${where}
       ORDER BY p.updated_at DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      listValues
    );

    return {
      items: result.rows.map(mapRow),
      total,
    };
  });
}

export async function getStoreProductById(productId: string): Promise<StoreProductRow | null> {
  return withDb(async (client) => {
    const categorySlugColumn = await resolveCategorySlugColumn(client);
    const result = await client.queryObject<Record<string, unknown>>(
      `${productSelectSql(categorySlugColumn)}
       WHERE p.id = $1
         AND COALESCE(p.is_in_deletion_period, false) = false`,
      [productId]
    );
    const row = result.rows[0];
    return row ? mapRow(row) : null;
  });
}
