-- =============================================================================
-- Storefront product reads directly from ecommerce.products (+ categories join).
-- Used by list-products and get-product-by-id Edge Functions (service_role RPC).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.list_store_products(
  p_category_id uuid DEFAULT NULL,
  p_category_slug text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ecommerce, public
AS $$
DECLARE
  v_total bigint;
  v_items jsonb;
  v_search_pattern text;
BEGIN
  IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
    v_search_pattern :=
      '%'
      || replace(replace(replace(trim(p_search), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_')
      || '%';
  ELSE
    v_search_pattern := NULL;
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM ecommerce.products p
  LEFT JOIN ecommerce.categories c ON c.id = p.category_id
  WHERE p.is_in_deletion_period = false
    AND p.is_active = true
    AND (
      CASE
        WHEN p_category_id IS NOT NULL THEN p.category_id = p_category_id
        WHEN p_category_slug IS NOT NULL AND btrim(p_category_slug) <> '' THEN c.source_slug = btrim(p_category_slug)
        ELSE TRUE
      END
    )
    AND (v_search_pattern IS NULL OR p.name ILIKE v_search_pattern ESCAPE E'\\')
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price);

  SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb) INTO v_items
  FROM (
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
      c.source_slug AS category_slug,
      p.is_active,
      p.is_in_deletion_period,
      p.weight_grams,
      COALESCE(p.tags, '{}'::text[]) AS tags,
      p.created_at,
      p.updated_at
    FROM ecommerce.products p
    LEFT JOIN ecommerce.categories c ON c.id = p.category_id
    WHERE p.is_in_deletion_period = false
      AND p.is_active = true
      AND (
        CASE
          WHEN p_category_id IS NOT NULL THEN p.category_id = p_category_id
          WHEN p_category_slug IS NOT NULL AND btrim(p_category_slug) <> '' THEN c.source_slug = btrim(p_category_slug)
          ELSE TRUE
        END
      )
      AND (v_search_pattern IS NULL OR p.name ILIKE v_search_pattern ESCAPE E'\\')
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) t;

  RETURN jsonb_build_object('items', v_items, 'total', v_total);
END;
$$;

COMMENT ON FUNCTION public.list_store_products IS
  'Lists active storefront products from ecommerce.products (joins ecommerce.categories for category_slug).';

CREATE OR REPLACE FUNCTION public.get_store_product_by_id(p_product_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ecommerce, public
AS $$
  SELECT to_jsonb(row)
  FROM (
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
      c.source_slug AS category_slug,
      p.is_active,
      p.is_in_deletion_period,
      p.weight_grams,
      COALESCE(p.tags, '{}'::text[]) AS tags,
      p.created_at,
      p.updated_at
    FROM ecommerce.products p
    LEFT JOIN ecommerce.categories c ON c.id = p.category_id
    WHERE p.id = p_product_id
      AND p.is_in_deletion_period = false
  ) row;
$$;

COMMENT ON FUNCTION public.get_store_product_by_id IS
  'Single product from ecommerce.products for PDP (excludes is_in_deletion_period).';

GRANT EXECUTE ON FUNCTION public.list_store_products(
  uuid, text, text, numeric, numeric, int, int
) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_store_product_by_id(uuid) TO service_role;
