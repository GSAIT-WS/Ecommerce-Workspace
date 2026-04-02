-- =============================================================================
-- Migration: 0017_is_in_deletion_period.sql
-- Description: Adds is_in_deletion_period to ecommerce.products, synced from
--              ims_catalog.products.is_in_deletion_period.
--
-- Semantic contract (kept distinct from is_active):
--   is_active = false          → Temporarily deactivated. Product detail page
--                                 shows "unavailable temporarily" banner.
--   is_in_deletion_period = true → Product is being discontinued. Excluded
--                                  entirely from all public-facing queries and
--                                  cannot be added to cart or ordered.
--
-- View change: the public.ecommerce_products view previously filtered
--   WHERE p.is_active = true, which prevented get-product-by-id from returning
--   deactivated products (breaking the "temporarily unavailable" UX). This
--   migration corrects that: the view now filters only on
--   is_in_deletion_period = false. The list-products edge function retains its
--   own .eq("is_active", true) filter so product listings continue to show only
--   active products.
-- =============================================================================

-- ── 1. Add column ──────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.products
  ADD COLUMN IF NOT EXISTS is_in_deletion_period BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN ecommerce.products.is_in_deletion_period IS
  'Synced from ims_catalog.products.is_in_deletion_period. '
  'When true the product is in its discontinuation/deletion period and must not '
  'be displayed or sold. Semantically distinct from is_active = false which '
  'represents temporary deactivation.';

-- ── 2. Rebuild public.ecommerce_products view ──────────────────────────────────
-- Changes vs 0016:
--   • is_in_deletion_period added to SELECT list.
--   • WHERE clause changed from "p.is_active = true" to
--     "p.is_in_deletion_period = false" — inactive (deactivated) products are
--     now returned so the frontend can show the "unavailable temporarily" banner.
--     Products in the deletion period are fully hidden.
DO $$
DECLARE
  slug_col    TEXT;
  has_sort    BOOLEAN;
  has_ext_id  BOOLEAN;
  has_desc    BOOLEAN;
  has_comp    BOOLEAN;
  has_gallery BOOLEAN;
  has_weight  BOOLEAN;
BEGIN
  SELECT column_name INTO slug_col
  FROM information_schema.columns
  WHERE table_schema = 'ecommerce'
    AND table_name   = 'categories'
    AND column_name  IN ('slug', 'source_slug')
  ORDER BY column_name
  LIMIT 1;

  IF slug_col IS NULL THEN
    RAISE EXCEPTION 'ecommerce.categories has neither a slug nor source_slug column';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'ecommerce' AND table_name = 'categories' AND column_name = 'sort_order'
  ) INTO has_sort;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'ecommerce' AND table_name = 'products' AND column_name = 'product_external_id'
  ) INTO has_ext_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'ecommerce' AND table_name = 'products' AND column_name = 'description'
  ) INTO has_desc;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'ecommerce' AND table_name = 'products' AND column_name = 'compare_at_price'
  ) INTO has_comp;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'ecommerce' AND table_name = 'products' AND column_name = 'gallery_urls'
  ) INTO has_gallery;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'ecommerce' AND table_name = 'products' AND column_name = 'weight_grams'
  ) INTO has_weight;

  -- Recreate products view: expose is_in_deletion_period, filter on it only.
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
      p.updated_at,
      p.is_in_deletion_period
    FROM ecommerce.products p
    LEFT JOIN ecommerce.categories c ON c.id = p.category_id
    WHERE p.is_in_deletion_period = false
  $q$,
    CASE WHEN has_ext_id  THEN 'p.product_external_id,' ELSE 'NULL::text    AS product_external_id,' END,
    CASE WHEN has_desc    THEN 'p.description,'          ELSE 'NULL::text    AS description,'          END,
    CASE WHEN has_comp    THEN 'p.compare_at_price,'     ELSE 'NULL::numeric AS compare_at_price,'     END,
    CASE WHEN has_gallery THEN 'p.gallery_urls,'         ELSE 'ARRAY[]::text[] AS gallery_urls,'       END,
    slug_col,
    CASE WHEN has_weight  THEN 'p.weight_grams,'         ELSE 'NULL::integer AS weight_grams,'         END
  );

  -- Recreate categories view (unchanged from 0016, re-run to keep consistent).
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
END $$;

-- Re-grant read access
GRANT SELECT ON public.ecommerce_products   TO anon, authenticated, service_role;
GRANT SELECT ON public.ecommerce_categories TO anon, authenticated, service_role;

-- ── 3. Update get_cart_ims_items: block deletion-period products ───────────────
CREATE OR REPLACE FUNCTION ecommerce.get_cart_ims_items(
  p_customer_id         uuid,
  p_shipping_address_id uuid,
  p_coupon_code         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id           uuid;
  v_ims_reserve_items jsonb := '[]'::jsonb;
  v_combo_ims_items   jsonb;
  v_item              RECORD;
  v_product           ecommerce.products%ROWTYPE;
  v_combo             ecommerce.combos%ROWTYPE;
  v_avail_qty         integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_customer_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'customer_not_found');
  END IF;

  IF p_shipping_address_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ecommerce.addresses
      WHERE id = p_shipping_address_id AND customer_id = p_customer_id
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_shipping_address');
    END IF;
  END IF;

  SELECT id INTO v_cart_id
  FROM ecommerce.cart
  WHERE customer_id = p_customer_id;

  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_not_found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM ecommerce.cart_items WHERE cart_id = v_cart_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_is_empty');
  END IF;

  FOR v_item IN
    SELECT ci.* FROM ecommerce.cart_items ci WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product FROM ecommerce.products WHERE id = v_item.product_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_not_found',
                                  'product_id', v_item.product_id);
      END IF;

      -- Block deletion-period products (hard stop — not displayable or purchasable)
      IF v_product.is_in_deletion_period THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_in_deletion_period',
                                  'sku', v_product.product_external_id);
      END IF;

      -- Block temporarily deactivated products
      IF NOT v_product.is_active THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_unavailable',
                                  'sku', v_product.product_external_id);
      END IF;

      SELECT available_quantity INTO v_avail_qty
      FROM ecommerce.stock_levels
      WHERE product_id = v_item.product_id;

      IF v_avail_qty IS NULL OR v_avail_qty < v_item.quantity THEN
        RETURN jsonb_build_object('ok', false, 'error', 'insufficient_stock',
                                  'sku', v_product.product_external_id,
                                  'available', COALESCE(v_avail_qty, 0),
                                  'requested', v_item.quantity);
      END IF;

      v_ims_reserve_items := v_ims_reserve_items || jsonb_build_object(
        'sku',      v_product.product_external_id,
        'quantity', v_item.quantity
      );

    ELSIF v_item.item_type = 'combo' THEN
      SELECT * INTO v_combo FROM ecommerce.combos WHERE id = v_item.combo_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'combo_not_found',
                                  'combo_id', v_item.combo_id);
      END IF;

      IF NOT v_combo.is_active THEN
        RETURN jsonb_build_object('ok', false, 'error', 'combo_unavailable',
                                  'combo_id', v_item.combo_id);
      END IF;

      PERFORM 1
      FROM ecommerce.combo_items ci_inner
      JOIN ecommerce.stock_levels sl ON sl.product_id = ci_inner.product_id
      WHERE ci_inner.combo_id = v_item.combo_id
        AND sl.available_quantity < v_item.quantity;

      IF FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'insufficient_stock_for_combo',
                                  'combo_id', v_item.combo_id);
      END IF;

      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'sku',      p.product_external_id,
               'quantity', ci_inner.quantity * v_item.quantity
             )), '[]'::jsonb)
      INTO v_combo_ims_items
      FROM ecommerce.combo_items ci_inner
      JOIN ecommerce.products p ON p.id = ci_inner.product_id
      WHERE ci_inner.combo_id = v_item.combo_id;

      v_ims_reserve_items := v_ims_reserve_items || v_combo_ims_items;
    END IF;
  END LOOP;

  IF p_coupon_code IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ecommerce.coupons
      WHERE code = p_coupon_code AND is_active = true
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'coupon_not_found',
                                'code', p_coupon_code);
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'ims_reserve_items', v_ims_reserve_items);
END;
$$;

COMMENT ON FUNCTION ecommerce.get_cart_ims_items(uuid, uuid, text) IS
  'Returns IMS reservation payload for cart. No order created. '
  'Blocks products that are is_in_deletion_period=true or is_active=false. '
  'Used by place-order Edge Function to call IMS reserve API before creating order.';

-- ── 4. Update place_order: block deletion-period products ─────────────────────
CREATE OR REPLACE FUNCTION ecommerce.place_order(
  p_customer_id         uuid,
  p_shipping_address_id uuid,
  p_coupon_code         text DEFAULT NULL,
  p_notes               text DEFAULT NULL,
  p_order_id            uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id           uuid;
  v_order_id          uuid;
  v_order_number      text;
  v_subtotal          numeric(12, 2) := 0;
  v_discount_amount   numeric(12, 2) := 0;
  v_shipping_amount   numeric(12, 2) := 0;
  v_tax_amount        numeric(12, 2) := 0;
  v_total_amount      numeric(12, 2) := 0;
  v_coupon            ecommerce.coupons%ROWTYPE;
  v_discount_rule     ecommerce.discount_rules%ROWTYPE;
  v_pricing_items     jsonb := '[]'::jsonb;
  v_ims_reserve_items jsonb := '[]'::jsonb;
  v_combo_ims_items   jsonb;
  v_discount_snapshot jsonb := 'null'::jsonb;
  v_addr_snapshot     jsonb;
  v_item              RECORD;
  v_product           ecommerce.products%ROWTYPE;
  v_combo             ecommerce.combos%ROWTYPE;
  v_avail_qty         integer;
  v_line_total        numeric(12, 2);
BEGIN
  v_order_id := COALESCE(p_order_id, gen_random_uuid());

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_customer_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'customer_not_found');
  END IF;

  IF p_shipping_address_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ecommerce.addresses
      WHERE id = p_shipping_address_id AND customer_id = p_customer_id
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_shipping_address');
    END IF;
  END IF;

  SELECT id INTO v_cart_id
  FROM ecommerce.cart
  WHERE customer_id = p_customer_id;

  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_not_found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM ecommerce.cart_items WHERE cart_id = v_cart_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_is_empty');
  END IF;

  FOR v_item IN
    SELECT ci.* FROM ecommerce.cart_items ci WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product FROM ecommerce.products WHERE id = v_item.product_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_not_found',
                                  'product_id', v_item.product_id);
      END IF;

      -- Block deletion-period products (hard stop — not displayable or purchasable)
      IF v_product.is_in_deletion_period THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_in_deletion_period',
                                  'sku', v_product.product_external_id);
      END IF;

      -- Block temporarily deactivated products
      IF NOT v_product.is_active THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_unavailable',
                                  'sku', v_product.product_external_id);
      END IF;

      SELECT available_quantity INTO v_avail_qty
      FROM ecommerce.stock_levels
      WHERE product_id = v_item.product_id;

      IF v_avail_qty IS NULL OR v_avail_qty < v_item.quantity THEN
        RETURN jsonb_build_object('ok', false, 'error', 'insufficient_stock',
                                  'sku', v_product.product_external_id,
                                  'available', COALESCE(v_avail_qty, 0),
                                  'requested', v_item.quantity);
      END IF;

      v_line_total := v_product.price * v_item.quantity;
      v_subtotal   := v_subtotal + v_line_total;

      v_pricing_items := v_pricing_items || jsonb_build_object(
        'item_type',           'product',
        'product_id',          v_product.id,
        'product_external_id', v_product.product_external_id,
        'sku',                 v_product.product_external_id,
        'name',                v_product.name,
        'unit_price',          v_product.price,
        'quantity',            v_item.quantity,
        'line_total',          v_line_total
      );

      v_ims_reserve_items := v_ims_reserve_items || jsonb_build_object(
        'sku',      v_product.product_external_id,
        'quantity', v_item.quantity
      );

    ELSIF v_item.item_type = 'combo' THEN
      SELECT * INTO v_combo FROM ecommerce.combos WHERE id = v_item.combo_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'combo_not_found',
                                  'combo_id', v_item.combo_id);
      END IF;

      IF NOT v_combo.is_active THEN
        RETURN jsonb_build_object('ok', false, 'error', 'combo_unavailable',
                                  'combo_id', v_item.combo_id);
      END IF;

      PERFORM 1
      FROM ecommerce.combo_items ci_inner
      JOIN ecommerce.stock_levels sl ON sl.product_id = ci_inner.product_id
      WHERE ci_inner.combo_id = v_item.combo_id
        AND sl.available_quantity < v_item.quantity;

      IF FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'insufficient_stock_for_combo',
                                  'combo_id', v_item.combo_id);
      END IF;

      v_line_total := v_combo.combo_price * v_item.quantity;
      v_subtotal   := v_subtotal + v_line_total;

      v_pricing_items := v_pricing_items || jsonb_build_object(
        'item_type',  'combo',
        'combo_id',   v_combo.id,
        'name',       v_combo.name,
        'unit_price', v_combo.combo_price,
        'quantity',   v_item.quantity,
        'line_total', v_line_total
      );

      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'sku',      p.product_external_id,
               'quantity', ci_inner.quantity * v_item.quantity
             )), '[]'::jsonb)
      INTO v_combo_ims_items
      FROM ecommerce.combo_items ci_inner
      JOIN ecommerce.products p ON p.id = ci_inner.product_id
      WHERE ci_inner.combo_id = v_item.combo_id;

      v_ims_reserve_items := v_ims_reserve_items || v_combo_ims_items;
    END IF;
  END LOOP;

  IF p_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon
    FROM ecommerce.coupons
    WHERE code = p_coupon_code AND is_active = true;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'coupon_not_found',
                                'code', p_coupon_code);
    END IF;

    IF v_coupon.valid_from IS NOT NULL AND now() < v_coupon.valid_from THEN
      RETURN jsonb_build_object('ok', false, 'error', 'coupon_not_yet_valid');
    END IF;

    IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
      RETURN jsonb_build_object('ok', false, 'error', 'coupon_expired');
    END IF;

    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
      RETURN jsonb_build_object('ok', false, 'error', 'coupon_usage_limit_reached');
    END IF;

    IF v_coupon.discount_rule_id IS NOT NULL THEN
      SELECT * INTO v_discount_rule
      FROM ecommerce.discount_rules
      WHERE id = v_coupon.discount_rule_id AND is_active = true;
    END IF;

    IF v_discount_rule.id IS NOT NULL THEN
      IF v_discount_rule.min_order_amount IS NOT NULL
         AND v_subtotal < v_discount_rule.min_order_amount THEN
        RETURN jsonb_build_object('ok', false, 'error', 'order_below_minimum_for_coupon',
                                  'minimum',  v_discount_rule.min_order_amount,
                                  'subtotal', v_subtotal);
      END IF;

      IF v_discount_rule.discount_type = 'percentage' THEN
        v_discount_amount := ROUND(v_subtotal * (v_discount_rule.discount_value / 100), 2);
      ELSIF v_discount_rule.discount_type = 'fixed_amount' THEN
        v_discount_amount := LEAST(v_discount_rule.discount_value, v_subtotal);
      ELSIF v_discount_rule.discount_type = 'free_shipping' THEN
        v_shipping_amount := 0;
      END IF;

      IF v_discount_rule.max_discount_amount IS NOT NULL THEN
        v_discount_amount := LEAST(v_discount_amount, v_discount_rule.max_discount_amount);
      END IF;
    END IF;

    v_discount_snapshot := jsonb_build_object(
      'code',           p_coupon_code,
      'rule_source_id', v_discount_rule.source_id,
      'rule_type',      v_discount_rule.discount_type,
      'discount_value', v_discount_rule.discount_value,
      'amount_saved',   v_discount_amount
    );

    UPDATE ecommerce.coupons
    SET used_count = used_count + 1
    WHERE id = v_coupon.id;
  END IF;

  v_total_amount := v_subtotal - v_discount_amount + v_shipping_amount + v_tax_amount;

  IF p_shipping_address_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'recipient_name', recipient_name,
      'phone',          phone,
      'address_line1',  address_line1,
      'address_line2',  address_line2,
      'city',           city,
      'state',          state,
      'postal_code',    postal_code,
      'country',        country
    ) INTO v_addr_snapshot
    FROM ecommerce.addresses
    WHERE id = p_shipping_address_id;
  END IF;

  INSERT INTO ecommerce.orders (
    id, customer_id, shipping_address_id, status,
    subtotal, discount_amount, shipping_amount, tax_amount, total_amount,
    coupon_code, pricing_snapshot, discount_snapshot, shipping_address_snapshot, notes
  ) VALUES (
    v_order_id, p_customer_id, p_shipping_address_id, 'pending',
    v_subtotal, v_discount_amount, v_shipping_amount, v_tax_amount, v_total_amount,
    p_coupon_code, jsonb_build_object('items', v_pricing_items),
    v_discount_snapshot, v_addr_snapshot, p_notes
  )
  RETURNING order_number INTO v_order_number;

  FOR v_item IN
    SELECT ci.* FROM ecommerce.cart_items ci WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product FROM ecommerce.products WHERE id = v_item.product_id;

      INSERT INTO ecommerce.order_items (
        order_id, item_type, product_id, product_external_id, sku,
        name_snapshot, unit_price, quantity, line_total
      ) VALUES (
        v_order_id, 'product', v_product.id, v_product.product_external_id, v_product.product_external_id,
        v_product.name, v_product.price,
        v_item.quantity, v_product.price * v_item.quantity
      );

    ELSIF v_item.item_type = 'combo' THEN
      SELECT * INTO v_combo FROM ecommerce.combos WHERE id = v_item.combo_id;

      INSERT INTO ecommerce.order_items (
        order_id, item_type, combo_id,
        name_snapshot, unit_price, quantity, line_total, combo_details_json
      ) VALUES (
        v_order_id, 'combo', v_combo.id,
        v_combo.name, v_combo.combo_price,
        v_item.quantity, v_combo.combo_price * v_item.quantity,
        v_item.customization_json
      );
    END IF;
  END LOOP;

  DELETE FROM ecommerce.cart_items WHERE cart_id = v_cart_id;

  RETURN jsonb_build_object(
    'ok',                true,
    'order_id',          v_order_id,
    'order_number',      v_order_number,
    'total_amount',      v_total_amount,
    'status',            'pending',
    'pricing_items',     v_pricing_items,
    'ims_reserve_items', v_ims_reserve_items
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

COMMENT ON FUNCTION ecommerce.place_order(uuid, uuid, text, text, uuid) IS
  'Creates order from cart. Blocks products that are is_in_deletion_period=true '
  'or is_active=false. When p_order_id provided, uses it (for IMS-first flow). '
  'Edge Function must call IMS reserve API BEFORE this, then pass the reserved order_id.';
