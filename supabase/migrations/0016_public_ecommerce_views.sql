-- =============================================================================
-- Migration: 0016_public_ecommerce_views.sql
-- Description: Public read-only views that expose ecommerce schema tables
--              through the PostgREST API (public schema is always exposed).
-- =============================================================================

DO $$
DECLARE
  slug_col      TEXT;
  has_sort      BOOLEAN;
  has_ext_id    BOOLEAN;
  has_desc      BOOLEAN;
  has_comp      BOOLEAN;
  has_gallery   BOOLEAN;
  has_weight    BOOLEAN;
BEGIN
  -- ── Detect slug column name ──────────────────────────────────────────────
  SELECT column_name INTO slug_col
  FROM information_schema.columns
  WHERE table_schema = 'ecommerce'
    AND table_name   = 'categories'
    AND column_name  IN ('slug', 'source_slug')
  ORDER BY column_name  -- 'slug' comes before 'source_slug'
  LIMIT 1;

  IF slug_col IS NULL THEN
    RAISE EXCEPTION 'ecommerce.categories has neither a slug nor source_slug column';
  END IF;

  -- ── Detect optional columns on ecommerce.categories ──────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='ecommerce' AND table_name='categories' AND column_name='sort_order'
  ) INTO has_sort;

  -- ── Categories view ───────────────────────────────────────────────────────
  EXECUTE format($q$
    CREATE OR REPLACE VIEW public.ecommerce_categories AS
    SELECT
      id,
      name,
      %I AS slug,
      image_url,
      is_active
      %s
    FROM ecommerce.categories
    WHERE is_active = true
  $q$,
    slug_col,
    CASE WHEN has_sort THEN ', sort_order' ELSE '' END
  );

  -- ── Detect optional columns on ecommerce.products ────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='ecommerce' AND table_name='products' AND column_name='product_external_id'
  ) INTO has_ext_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='ecommerce' AND table_name='products' AND column_name='description'
  ) INTO has_desc;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='ecommerce' AND table_name='products' AND column_name='compare_at_price'
  ) INTO has_comp;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='ecommerce' AND table_name='products' AND column_name='gallery_urls'
  ) INTO has_gallery;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='ecommerce' AND table_name='products' AND column_name='weight_grams'
  ) INTO has_weight;

  -- ── Products view ─────────────────────────────────────────────────────────
  EXECUTE format($q$
    CREATE OR REPLACE VIEW public.ecommerce_products AS
    SELECT
      p.id,
      %s
      p.name,
      %s
      p.price,
      %s
      p.image_url,
      %s
      p.category_id,
      c.%I AS category_slug,
      p.is_active,
      %s
      p.tags,
      p.created_at,
      p.updated_at
    FROM ecommerce.products p
    LEFT JOIN ecommerce.categories c ON c.id = p.category_id
    WHERE p.is_active = true
  $q$,
    CASE WHEN has_ext_id  THEN 'p.product_external_id,' ELSE 'NULL::text AS product_external_id,' END,
    CASE WHEN has_desc    THEN 'p.description,'          ELSE 'NULL::text AS description,'          END,
    CASE WHEN has_comp    THEN 'p.compare_at_price,'     ELSE 'NULL::numeric AS compare_at_price,'  END,
    CASE WHEN has_gallery THEN 'p.gallery_urls,'         ELSE 'ARRAY[]::text[] AS gallery_urls,'    END,
    slug_col,
    CASE WHEN has_weight  THEN 'p.weight_grams,'         ELSE 'NULL::integer AS weight_grams,'      END
  );

END $$;

-- Grant read access to all Supabase roles
GRANT SELECT ON public.ecommerce_products   TO anon, authenticated, service_role;
GRANT SELECT ON public.ecommerce_categories TO anon, authenticated, service_role;
