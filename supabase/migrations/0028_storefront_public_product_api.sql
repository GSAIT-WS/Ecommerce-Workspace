-- =============================================================================
-- Storefront product API for PostgREST (anon/authenticated direct reads).
-- Safe to run when 0015/0026 were not applied on the remote project.
-- =============================================================================

DO $$
DECLARE
  slug_col TEXT;
BEGIN
  SELECT column_name INTO slug_col
  FROM information_schema.columns
  WHERE table_schema = 'ecommerce'
    AND table_name = 'categories'
    AND column_name IN ('slug', 'source_slug')
  ORDER BY CASE column_name WHEN 'source_slug' THEN 0 ELSE 1 END
  LIMIT 1;

  IF slug_col IS NULL THEN
    RAISE EXCEPTION 'ecommerce.categories has neither slug nor source_slug';
  END IF;

  EXECUTE format($q$
    CREATE OR REPLACE VIEW public.ecommerce_products AS
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
      c.%I AS category_slug,
      p.is_active,
      COALESCE(p.is_in_deletion_period, false) AS is_in_deletion_period,
      p.weight_grams,
      COALESCE(p.tags, '{}'::text[]) AS tags,
      p.created_at,
      p.updated_at
    FROM ecommerce.products p
    LEFT JOIN ecommerce.categories c ON c.id = p.category_id
    WHERE p.is_active = true
      AND COALESCE(p.is_in_deletion_period, false) = false
  $q$, slug_col);

  EXECUTE format($q$
    CREATE OR REPLACE VIEW public.ecommerce_categories AS
    SELECT
      id,
      name,
      %I AS slug,
      image_url,
      is_active,
      sort_order
    FROM ecommerce.categories
    WHERE is_active = true
  $q$, slug_col);
END $$;

GRANT SELECT ON public.ecommerce_products TO anon, authenticated, service_role;
GRANT SELECT ON public.ecommerce_categories TO anon, authenticated, service_role;
