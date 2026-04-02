-- =============================================================================
-- Migration: 0015_ims_integration.sql
-- Description: IMS (Inventory Management System) integration support.
--
-- Adds:
--   1. get_cart_ims_items RPC - Returns IMS reservation payload without creating order.
--      Used by place-order Edge Function to call IMS reserve API BEFORE creating order.
--   2. place_order accepts optional p_order_id - When IMS reserves with a pre-generated
--      order_id, we create the order with that exact ID for consistency.
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. get_cart_ims_items - Preview IMS items for reservation (no order created)
-- ────────────────────────────────────────────────────────────────────────────
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
  v_cart_id         uuid;
  v_ims_reserve_items jsonb := '[]'::jsonb;
  v_combo_ims_items   jsonb;
  v_item             RECORD;
  v_product          ecommerce.products%ROWTYPE;
  v_combo            ecommerce.combos%ROWTYPE;
  v_avail_qty        integer;
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

  -- 4. Validate items + soft stock check, build IMS items
  FOR v_item IN
    SELECT ci.* FROM ecommerce.cart_items ci WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product FROM ecommerce.products WHERE id = v_item.product_id;

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

  -- 5. Coupon validation (optional, for consistency with place_order)
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

COMMENT ON FUNCTION ecommerce.get_cart_ims_items IS
  'Returns IMS reservation payload for cart. No order created. '
  'Used by place-order Edge Function to call IMS reserve API before creating order.';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. place_order - Add optional p_order_id for IMS-first flow
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.place_order(
  p_customer_id         uuid,
  p_shipping_address_id uuid,
  p_coupon_code         text DEFAULT NULL,
  p_notes               text DEFAULT NULL,
  p_order_id            uuid DEFAULT NULL  -- When provided, use for order (IMS pre-reserved)
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
  -- Use provided order_id or generate new one
  v_order_id := COALESCE(p_order_id, gen_random_uuid());

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
    SELECT ci.* FROM ecommerce.cart_items ci WHERE ci.cart_id = v_cart_id
  LOOP
    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product FROM ecommerce.products WHERE id = v_item.product_id;

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

  -- 8. Create order (use v_order_id which may be pre-generated for IMS)
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

  -- 9. Create order items (include sku for IMS consistency)
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

COMMENT ON FUNCTION ecommerce.place_order IS
  'Creates order from cart. When p_order_id provided, uses it (for IMS-first flow). '
  'Edge Function must call IMS reserve API BEFORE this, then pass the reserved order_id.';
