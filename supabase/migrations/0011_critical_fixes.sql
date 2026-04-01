-- =============================================================================
-- Migration: 0011_critical_fixes.sql
-- Description:
--   1. Fix cart_items CHECK constraint to allow custom combos (combo_id NULL
--      with customization_json).
--   2. Replace UNIQUE NULLS NOT DISTINCT with partial unique indexes so carts
--      can hold multiple products and multiple combos.
--   3. Fix clear_customer_cart type error (uuid vs bigint).
--   4. Fix add_item_to_cart combo price accumulation bug.
--   5. Fix place_order: append combo IMS items instead of overwriting.
--   6. Fix cancel_order & process_payment_webhook: include combo product SKUs
--      in ims_release_items.
--   7. Fix 0010 migration header numbering (cosmetic — no-op).
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Relax CHECK constraint on cart_items to allow custom combos
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.cart_items DROP CONSTRAINT IF EXISTS chk_cart_item_type;

ALTER TABLE ecommerce.cart_items ADD CONSTRAINT chk_cart_item_type CHECK (
  (item_type = 'product' AND product_id IS NOT NULL AND combo_id IS NULL) OR
  (item_type = 'combo' AND combo_id IS NOT NULL AND product_id IS NULL) OR
  (item_type = 'combo' AND combo_id IS NULL AND product_id IS NULL AND customization_json IS NOT NULL)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Replace UNIQUE NULLS NOT DISTINCT with partial unique indexes
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_key;
ALTER TABLE ecommerce.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_cart_id_combo_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_product_unique
  ON ecommerce.cart_items (cart_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_combo_unique
  ON ecommerce.cart_items (cart_id, combo_id) WHERE combo_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Fix clear_customer_cart: use separate bigint variable for count
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.clear_customer_cart(p_customer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id uuid;
  v_count   bigint;
BEGIN
  SELECT id INTO v_cart_id FROM ecommerce.cart WHERE customer_id = p_customer_id;
  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'cleared', 0);
  END IF;

  WITH deleted AS (
    DELETE FROM ecommerce.cart_items WHERE cart_id = v_cart_id RETURNING id
  )
  SELECT count(*) INTO v_count FROM deleted;

  RETURN jsonb_build_object('ok', true, 'cleared', v_count);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Fix add_item_to_cart: correct combo price accumulation
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.add_item_to_cart(
  p_customer_id      uuid,
  p_item_type        text,
  p_product_id       uuid    DEFAULT NULL,
  p_combo_id         uuid    DEFAULT NULL,
  p_quantity         integer DEFAULT 1,
  p_customization    jsonb   DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id    uuid;
  v_item_id    uuid;
  v_existing   RECORD;
  v_unit_price numeric(12,2);
  v_item_price numeric(12,2);
BEGIN
  v_cart_id := ecommerce.get_or_create_cart(p_customer_id);

  IF p_item_type = 'product' THEN
    IF p_product_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'product_id_required');
    END IF;

    SELECT price, is_active INTO v_unit_price, v_existing.is_active
    FROM ecommerce.products WHERE id = p_product_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'product_not_found');
    END IF;
    IF NOT v_existing.is_active THEN
      RETURN jsonb_build_object('ok', false, 'error', 'product_unavailable');
    END IF;

    SELECT id, quantity INTO v_existing
    FROM ecommerce.cart_items
    WHERE cart_id = v_cart_id AND product_id = p_product_id AND item_type = 'product';

    IF FOUND THEN
      UPDATE ecommerce.cart_items
      SET quantity = v_existing.quantity + p_quantity,
          unit_price_snapshot = v_unit_price
      WHERE id = v_existing.id
      RETURNING id INTO v_item_id;
    ELSE
      INSERT INTO ecommerce.cart_items (cart_id, item_type, product_id, quantity, unit_price_snapshot)
      VALUES (v_cart_id, 'product', p_product_id, p_quantity, v_unit_price)
      RETURNING id INTO v_item_id;
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'cart_item_id', v_item_id,
      'product_id', p_product_id,
      'quantity', COALESCE(v_existing.quantity, 0) + p_quantity,
      'unit_price', v_unit_price
    );

  ELSIF p_item_type = 'combo' THEN
    IF p_customization IS NULL OR p_customization->'items' IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'customization_required');
    END IF;

    v_unit_price := 0;
    FOR v_existing IN
      SELECT (item->>'product_id')::uuid AS pid, (item->>'quantity')::int AS qty
      FROM jsonb_array_elements(p_customization->'items') AS item
    LOOP
      SELECT price INTO STRICT v_item_price
      FROM ecommerce.products WHERE id = v_existing.pid AND is_active = true;
      v_unit_price := v_unit_price + v_item_price * v_existing.qty;
    END LOOP;

    INSERT INTO ecommerce.cart_items (cart_id, item_type, combo_id, quantity, unit_price_snapshot, customization_json)
    VALUES (v_cart_id, 'combo', p_combo_id, p_quantity, v_unit_price, p_customization)
    RETURNING id INTO v_item_id;

    RETURN jsonb_build_object(
      'ok', true,
      'cart_item_id', v_item_id,
      'quantity', p_quantity,
      'unit_price', v_unit_price
    );
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_item_type');
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Fix place_order: APPEND combo IMS items instead of overwriting
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.place_order(
  p_customer_id         uuid,
  p_shipping_address_id uuid,
  p_coupon_code         text DEFAULT NULL,
  p_notes               text DEFAULT NULL
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
  -- 1. Validate customer
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_customer_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'customer_not_found');
  END IF;

  -- 2. Validate shipping address
  IF p_shipping_address_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ecommerce.addresses
      WHERE id = p_shipping_address_id AND customer_id = p_customer_id
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_shipping_address');
    END IF;
  END IF;

  -- 3. Get cart
  SELECT id INTO v_cart_id
  FROM ecommerce.cart
  WHERE customer_id = p_customer_id;

  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_not_found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM ecommerce.cart_items WHERE cart_id = v_cart_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_is_empty');
  END IF;

  -- 4. Validate items + soft stock check
  FOR v_item IN
    SELECT ci.*
    FROM ecommerce.cart_items ci
    WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product
      FROM ecommerce.products
      WHERE id = v_item.product_id;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'product_not_found',
                                  'product_id', v_item.product_id);
      END IF;

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
      SELECT * INTO v_combo
      FROM ecommerce.combos
      WHERE id = v_item.combo_id;

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

      -- APPEND combo product SKUs to IMS reservation (not overwrite)
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

  -- 5. Validate and apply coupon
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

  -- 6. Calculate totals
  v_total_amount := v_subtotal - v_discount_amount + v_shipping_amount + v_tax_amount;

  -- 7. Snapshot shipping address
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

  -- 8. Create order
  INSERT INTO ecommerce.orders (
    customer_id, shipping_address_id, status,
    subtotal, discount_amount, shipping_amount, tax_amount, total_amount,
    coupon_code, pricing_snapshot, discount_snapshot, shipping_address_snapshot, notes
  ) VALUES (
    p_customer_id, p_shipping_address_id, 'pending',
    v_subtotal, v_discount_amount, v_shipping_amount, v_tax_amount, v_total_amount,
    p_coupon_code, jsonb_build_object('items', v_pricing_items),
    v_discount_snapshot, v_addr_snapshot, p_notes
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- 9. Create order items
  FOR v_item IN
    SELECT ci.* FROM ecommerce.cart_items ci WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product FROM ecommerce.products WHERE id = v_item.product_id;

      INSERT INTO ecommerce.order_items (
        order_id, item_type, product_id, product_external_id,
        name_snapshot, unit_price, quantity, line_total
      ) VALUES (
        v_order_id, 'product', v_product.id, v_product.product_external_id,
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

  -- 10. Clear cart
  DELETE FROM ecommerce.cart_items WHERE cart_id = v_cart_id;

  -- 11. Return order + IMS reservation payload
  RETURN jsonb_build_object(
    'ok',               true,
    'order_id',         v_order_id,
    'order_number',     v_order_number,
    'total_amount',     v_total_amount,
    'status',           'pending',
    'pricing_items',    v_pricing_items,
    'ims_reserve_items', v_ims_reserve_items
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Fix cancel_order: include combo product SKUs in ims_release_items
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.cancel_order(
  p_order_id    uuid,
  p_customer_id uuid,
  p_reason      text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_order           ecommerce.orders%ROWTYPE;
  v_release_items   jsonb;
BEGIN
  SELECT * INTO v_order
  FROM ecommerce.orders
  WHERE id = p_order_id AND customer_id = p_customer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  IF v_order.status NOT IN ('pending', 'confirmed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_cancellable',
                              'current_status', v_order.status);
  END IF;

  UPDATE ecommerce.orders
  SET status = 'cancelled'
  WHERE id = p_order_id;

  INSERT INTO ecommerce.order_status_history (order_id, old_status, new_status, changed_by, notes)
  VALUES (p_order_id, v_order.status, 'cancelled', p_customer_id, p_reason);

  -- Build release items: direct products + combo constituent products
  SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO v_release_items
  FROM (
    -- Direct product order items
    SELECT jsonb_build_object(
             'sku',      oi.product_external_id,
             'quantity', oi.quantity
           ) AS item
    FROM ecommerce.order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.item_type = 'product'
      AND oi.product_external_id IS NOT NULL
    UNION ALL
    -- Combo constituent products
    SELECT jsonb_build_object(
             'sku',      p.product_external_id,
             'quantity', ci.quantity * oi.quantity
           ) AS item
    FROM ecommerce.order_items oi
    JOIN ecommerce.combo_items ci ON ci.combo_id = oi.combo_id
    JOIN ecommerce.products p ON p.id = ci.product_id
    WHERE oi.order_id = p_order_id
      AND oi.item_type = 'combo'
      AND oi.combo_id IS NOT NULL
  ) sub;

  RETURN jsonb_build_object(
    'ok',       true,
    'order_id', p_order_id,
    'status',   'cancelled',
    'ims_release_items', v_release_items
  );
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Fix process_payment_webhook: include combo product SKUs in ims_release_items
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.process_payment_webhook(
  p_external_id       text,
  p_status            ecommerce.payment_status,
  p_amount            numeric,
  p_provider_response jsonb DEFAULT NULL,
  p_failure_reason    text  DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_attempt       ecommerce.payment_attempts%ROWTYPE;
  v_order         ecommerce.orders%ROWTYPE;
  v_release_items jsonb;
BEGIN
  SELECT * INTO v_attempt
  FROM ecommerce.payment_attempts
  WHERE external_id = p_external_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'payment_attempt_not_found');
  END IF;

  IF v_attempt.status IN ('succeeded', 'failed', 'refunded') THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'status', v_attempt.status);
  END IF;

  SELECT * INTO v_order
  FROM ecommerce.orders
  WHERE id = v_attempt.order_id
  FOR UPDATE;

  UPDATE ecommerce.payment_attempts
  SET
    status            = p_status,
    provider_response = COALESCE(p_provider_response, provider_response),
    failure_reason    = p_failure_reason,
    updated_at        = now()
  WHERE id = v_attempt.id;

  IF p_status = 'succeeded' THEN
    IF v_order.status = 'pending' THEN
      UPDATE ecommerce.orders SET status = 'confirmed' WHERE id = v_order.id;
    END IF;

    RETURN jsonb_build_object(
      'ok',       true,
      'status',   'succeeded',
      'order_id', v_order.id
    );

  ELSIF p_status = 'failed' THEN
    IF v_order.status = 'pending' THEN
      UPDATE ecommerce.orders SET status = 'cancelled' WHERE id = v_order.id;

      INSERT INTO ecommerce.order_status_history (order_id, old_status, new_status, notes)
      VALUES (v_order.id, 'pending', 'cancelled', 'payment_failed: ' || COALESCE(p_failure_reason, 'unknown'));
    END IF;

    -- Build release items: direct products + combo constituent products
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO v_release_items
    FROM (
      SELECT jsonb_build_object(
               'sku',      oi.product_external_id,
               'quantity', oi.quantity
             ) AS item
      FROM ecommerce.order_items oi
      WHERE oi.order_id = v_order.id
        AND oi.item_type = 'product'
        AND oi.product_external_id IS NOT NULL
      UNION ALL
      SELECT jsonb_build_object(
               'sku',      p.product_external_id,
               'quantity', ci.quantity * oi.quantity
             ) AS item
      FROM ecommerce.order_items oi
      JOIN ecommerce.combo_items ci ON ci.combo_id = oi.combo_id
      JOIN ecommerce.products p ON p.id = ci.product_id
      WHERE oi.order_id = v_order.id
        AND oi.item_type = 'combo'
        AND oi.combo_id IS NOT NULL
    ) sub;

    RETURN jsonb_build_object(
      'ok',       true,
      'status',   'failed',
      'order_id', v_order.id,
      'ims_release_items', v_release_items
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', p_status, 'order_id', v_order.id);
END;
$$;
