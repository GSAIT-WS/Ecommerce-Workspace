-- =============================================================================
-- Migration: 0002_product_contract.sql
-- Description: IMS → Ecommerce product contract (read-only synced tables).
--              These tables are populated exclusively by the IMS sync pipeline
--              (Migration 013 on the IMS side, five auto-fire triggers).
--              Ecommerce runtime NEVER writes to these tables directly.
--
-- Contract version: v1
-- Sync direction:   IMS (source of truth) → Ecommerce (replica) — ONE-WAY ONLY
--
-- Sync key mapping (must match IMS Migration 013 trigger column names exactly):
--   ims_catalog.categories    →  ecommerce.categories     key: slug        → source_slug
--   ims_catalog.products      →  ecommerce.products       key: sku         → product_external_id
--   ims_ops.branch_stock_*    →  ecommerce.stock_levels   key: sku         → product_external_id
--   ims_ops.discounts         →  ecommerce.discount_rules key: id (uuid)   → source_id
--   ims_ops.coupons           →  ecommerce.coupons        key: code        → code
--
-- Versioning cols: source_version, source_updated_at, synced_at on every table
-- Latency SLA:     < 60 seconds
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Categories  (synced from ims_catalog.categories)
-- Stable sync key: source_slug ← ims_catalog.categories.slug
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.categories (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  source_slug     text    NOT NULL UNIQUE,   -- ims_catalog.categories.slug — stable cross-system key
  name            text    NOT NULL,
  parent_id       uuid    REFERENCES ecommerce.categories(id) ON DELETE SET NULL,
  image_url       text,
  sort_order      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  -- sync metadata
  source_version    bigint      NOT NULL DEFAULT 0,
  source_updated_at timestamptz,
  synced_at         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_source_slug ON ecommerce.categories (source_slug);
CREATE INDEX idx_categories_parent      ON ecommerce.categories (parent_id);
CREATE INDEX idx_categories_active      ON ecommerce.categories (is_active);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON ecommerce.categories
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON TABLE ecommerce.categories IS
  'Product categories synced one-way from ims_catalog.categories. '
  'source_slug matches ims_catalog.categories.slug (immutable stable key). '
  'IMS sync trigger upserts by source_slug. Do NOT manually edit IMS-owned columns.';

-- ────────────────────────────────────────────────────────────────────────────
-- Products  (synced from ims_catalog.products)
-- Stable sync key: product_external_id ← ims_catalog.products.sku
--
-- Approved contract fields (v1):
--   product_external_id (sku), name, description, price, compare_at_price,
--   image_url, gallery_urls, category source_slug, is_active, weight_grams, tags
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.products (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_external_id  text    NOT NULL UNIQUE,   -- ims_catalog.products.sku — stable cross-system key
  name                 text    NOT NULL,
  description          text,
  price                numeric(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price     numeric(12, 2)          CHECK (compare_at_price >= 0),
  image_url            text,
  gallery_urls         text[]  NOT NULL DEFAULT '{}',
  category_id          uuid    REFERENCES ecommerce.categories(id) ON DELETE SET NULL,
  is_active            boolean NOT NULL DEFAULT true,
  weight_grams         integer          CHECK (weight_grams >= 0),
  tags                 text[]  NOT NULL DEFAULT '{}',
  -- sync metadata
  source_version    bigint      NOT NULL DEFAULT 0,
  source_updated_at timestamptz,
  synced_at         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_external_id ON ecommerce.products (product_external_id);
CREATE INDEX idx_products_category    ON ecommerce.products (category_id);
CREATE INDEX idx_products_active      ON ecommerce.products (is_active);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON ecommerce.products
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON TABLE ecommerce.products IS
  'Ecommerce replica of ims_catalog.products. product_external_id = IMS sku. '
  'IMS sync trigger upserts by product_external_id. price is ims_catalog.products.salable_price. '
  'category_id is resolved from ecommerce.categories.source_slug at sync time.';

-- ────────────────────────────────────────────────────────────────────────────
-- Stock levels  (synced from ims_ops.branch_stock_events — warehouse branch only)
--
-- IMS manages authoritative stock via ims_reserve_ecommerce_stock() and
-- ims_release_ecommerce_stock() RPCs (called by ecommerce Edge Functions).
-- Those RPCs fire branch_stock_events (ecommerce_reserved / ecommerce_released)
-- which trigger sync to this table.
--
-- Ecommerce READS this table for fast stock validation at checkout.
-- Ecommerce NEVER writes to this table — IMS sync owns all mutations.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.stock_levels (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         uuid    NOT NULL UNIQUE REFERENCES ecommerce.products(id) ON DELETE CASCADE,
  available_quantity integer NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  reserved_quantity  integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  -- sync metadata
  source_updated_at timestamptz,
  synced_at         timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_product ON ecommerce.stock_levels (product_id);

CREATE TRIGGER trg_stock_levels_updated_at
  BEFORE UPDATE ON ecommerce.stock_levels
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON TABLE ecommerce.stock_levels IS
  'Read-only stock view synced from ims_ops warehouse branch_stock_events. '
  'Mutations are owned by IMS via ims_reserve_ecommerce_stock() and '
  'ims_release_ecommerce_stock() RPCs. Ecommerce only reads for validation.';

-- ────────────────────────────────────────────────────────────────────────────
-- Combos  (ecommerce-owned — not synced from IMS in contract v1)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.combos (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_external_id text    NOT NULL UNIQUE,
  name              text    NOT NULL,
  description       text,
  combo_price       numeric(12, 2) NOT NULL CHECK (combo_price >= 0),
  image_url         text,
  is_active         boolean NOT NULL DEFAULT true,
  -- sync metadata (reserved for future IMS combo sync)
  source_version    bigint      NOT NULL DEFAULT 0,
  source_updated_at timestamptz,
  synced_at         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_combos_updated_at
  BEFORE UPDATE ON ecommerce.combos
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

CREATE TABLE ecommerce.combo_items (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id   uuid    NOT NULL REFERENCES ecommerce.combos(id)   ON DELETE CASCADE,
  product_id uuid    NOT NULL REFERENCES ecommerce.products(id) ON DELETE CASCADE,
  quantity   integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (combo_id, product_id)
);

CREATE INDEX idx_combo_items_combo   ON ecommerce.combo_items (combo_id);
CREATE INDEX idx_combo_items_product ON ecommerce.combo_items (product_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Discount rules  (synced from ims_ops.discounts)
-- Stable sync key: source_id ← ims_ops.discounts.id (UUID)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.discount_rules (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           uuid    NOT NULL UNIQUE,   -- ims_ops.discounts.id — stable cross-system key
  name                text    NOT NULL,
  discount_type       ecommerce.discount_type NOT NULL DEFAULT 'none',
  discount_value      numeric(12, 2)           CHECK (discount_value >= 0),
  min_order_amount    numeric(12, 2)           CHECK (min_order_amount >= 0),
  max_discount_amount numeric(12, 2)           CHECK (max_discount_amount >= 0),
  applicable_to       text    NOT NULL DEFAULT 'all',  -- 'all' | 'category:<slug>' | 'product:<sku>'
  is_active           boolean NOT NULL DEFAULT true,
  -- sync metadata
  source_version    bigint      NOT NULL DEFAULT 0,
  source_updated_at timestamptz,
  synced_at         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_discount_rules_source_id ON ecommerce.discount_rules (source_id);
CREATE INDEX idx_discount_rules_active    ON ecommerce.discount_rules (is_active);

CREATE TRIGGER trg_discount_rules_updated_at
  BEFORE UPDATE ON ecommerce.discount_rules
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON TABLE ecommerce.discount_rules IS
  'Pricing rules synced from ims_ops.discounts. source_id = IMS discounts.id. '
  'IMS sync trigger upserts by source_id. Ecommerce never writes pricing rules.';

-- ────────────────────────────────────────────────────────────────────────────
-- Coupons  (synced from ims_ops.coupons)
-- Stable sync key: code ← ims_ops.coupons.code  (exact column name match)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.coupons (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text    NOT NULL UNIQUE,   -- ims_ops.coupons.code — stable cross-system key
  discount_rule_id uuid    REFERENCES ecommerce.discount_rules(id) ON DELETE SET NULL,
  description      text,
  max_uses         integer          CHECK (max_uses > 0),
  used_count       integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  max_uses_per_user integer         CHECK (max_uses_per_user > 0),
  valid_from       timestamptz,
  valid_until      timestamptz,
  is_active        boolean NOT NULL DEFAULT true,
  -- sync metadata
  source_version    bigint      NOT NULL DEFAULT 0,
  source_updated_at timestamptz,
  synced_at         timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code   ON ecommerce.coupons (code);
CREATE INDEX idx_coupons_active ON ecommerce.coupons (is_active);

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON ecommerce.coupons
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON TABLE ecommerce.coupons IS
  'Coupon definitions synced from ims_ops.coupons. code = IMS coupons.code. '
  'IMS sync trigger upserts by code. Ecommerce validates coupons at checkout '
  'from this table; used_count is incremented by place_order RPC. '
  'For high-value campaigns, Edge Function can do a final live IMS call.';

-- ────────────────────────────────────────────────────────────────────────────
-- RLS: Product contract tables are PUBLIC READ, service_role write only.
-- No customer auth required to browse products/categories.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.stock_levels   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.combos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.combo_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.coupons        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories"
  ON ecommerce.categories FOR SELECT USING (true);

CREATE POLICY "public_read_products"
  ON ecommerce.products FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_stock"
  ON ecommerce.stock_levels FOR SELECT USING (true);

CREATE POLICY "public_read_combos"
  ON ecommerce.combos FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_combo_items"
  ON ecommerce.combo_items FOR SELECT USING (true);

CREATE POLICY "public_read_discount_rules"
  ON ecommerce.discount_rules FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_coupons"
  ON ecommerce.coupons FOR SELECT USING (is_active = true);

-- Writes are service_role only (IMS sync pipeline uses service_role key).
-- service_role bypasses RLS by default in Supabase.
