-- =============================================================================
-- Migration: 0009_address_cart_sync_fixes.sql
-- Description: 
--   1. Partial unique index to enforce one default address per customer.
--   2. Helper RPCs for cart CRUD (used by edge functions).
--   3. Helper RPCs for address CRUD (used by edge functions).
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Enforce one default address per customer
-- ────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default_per_customer
  ON ecommerce.addresses (customer_id)
  WHERE is_default = true;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Cart helper RPCs
--    Edge Functions call these via supabase.rpc() so they don't need direct
--    schema access to ecommerce tables.
-- ────────────────────────────────────────────────────────────────────────────

-- 2a. Get cart items with product details
CREATE OR REPLACE FUNCTION ecommerce.get_cart_with_products(p_customer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id uuid;
  v_items  jsonb;
BEGIN
  SELECT id INTO v_cart_id FROM ecommerce.cart WHERE customer_id = p_customer_id;

  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('items', '[]'::jsonb);
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      ci.id,
      ci.item_type::text AS item_type,
      ci.product_id,
      ci.combo_id,
      ci.quantity,
      ci.unit_price_snapshot AS unit_price,
      ci.customization_json,
      ci.created_at,
      CASE WHEN ci.item_type = 'product' AND ci.product_id IS NOT NULL THEN
        jsonb_build_object(
          'id',               p.id,
          'name',             p.name,
          'description',      p.description,
          'price',            p.price,
          'compare_at_price', p.compare_at_price,
          'image_url',        p.image_url,
          'is_active',        p.is_active,
          'weight_grams',     p.weight_grams,
          'tags',             p.tags
        )
      ELSE NULL END AS product,
      CASE WHEN ci.item_type = 'combo' AND ci.combo_id IS NOT NULL THEN
        jsonb_build_object(
          'id',          co.id,
          'name',        co.name,
          'combo_price', co.combo_price,
          'image_url',   co.image_url
        )
      ELSE NULL END AS combo
    FROM ecommerce.cart_items ci
    LEFT JOIN ecommerce.products p  ON p.id  = ci.product_id AND ci.item_type = 'product'
    LEFT JOIN ecommerce.combos   co ON co.id = ci.combo_id   AND ci.item_type = 'combo'
    WHERE ci.cart_id = v_cart_id
    ORDER BY ci.created_at
  ) t;

  RETURN jsonb_build_object('items', v_items);
END;
$$;

-- 2b. Add item to cart (handles get_or_create_cart + upsert)
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
  v_cart_id   uuid;
  v_item_id   uuid;
  v_existing  RECORD;
  v_unit_price numeric(12,2);
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
      SELECT price INTO STRICT v_unit_price
      FROM ecommerce.products WHERE id = v_existing.pid AND is_active = true;
      v_unit_price := v_unit_price + (SELECT price FROM ecommerce.products WHERE id = v_existing.pid) * v_existing.qty;
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

-- 2c. Update cart item quantity
CREATE OR REPLACE FUNCTION ecommerce.update_cart_item_qty(
  p_customer_id  uuid,
  p_cart_item_id uuid,
  p_quantity     integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  SELECT id INTO v_cart_id FROM ecommerce.cart WHERE customer_id = p_customer_id;
  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_not_found');
  END IF;

  IF p_quantity <= 0 THEN
    DELETE FROM ecommerce.cart_items WHERE id = p_cart_item_id AND cart_id = v_cart_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'item_not_found');
    END IF;
    RETURN jsonb_build_object('ok', true, 'removed', true);
  END IF;

  UPDATE ecommerce.cart_items
  SET quantity = p_quantity
  WHERE id = p_cart_item_id AND cart_id = v_cart_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item_not_found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'cart_item_id', p_cart_item_id, 'quantity', p_quantity);
END;
$$;

-- 2d. Remove cart item
CREATE OR REPLACE FUNCTION ecommerce.remove_cart_item_rpc(
  p_customer_id  uuid,
  p_cart_item_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  SELECT id INTO v_cart_id FROM ecommerce.cart WHERE customer_id = p_customer_id;
  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cart_not_found');
  END IF;

  DELETE FROM ecommerce.cart_items WHERE id = p_cart_item_id AND cart_id = v_cart_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item_not_found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'removed', true);
END;
$$;

-- 2e. Clear entire cart
CREATE OR REPLACE FUNCTION ecommerce.clear_customer_cart(p_customer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  SELECT id INTO v_cart_id FROM ecommerce.cart WHERE customer_id = p_customer_id;
  IF v_cart_id IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'cleared', 0);
  END IF;

  WITH deleted AS (
    DELETE FROM ecommerce.cart_items WHERE cart_id = v_cart_id RETURNING id
  )
  SELECT count(*) INTO v_cart_id FROM deleted; -- reuse variable for count

  RETURN jsonb_build_object('ok', true, 'cleared', true);
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Address helper RPCs
-- ────────────────────────────────────────────────────────────────────────────

-- 3a. Add address
CREATE OR REPLACE FUNCTION ecommerce.add_customer_address(
  p_customer_id   uuid,
  p_label         text,
  p_recipient_name text,
  p_phone         text,
  p_address_line1 text,
  p_address_line2 text DEFAULT NULL,
  p_city          text DEFAULT 'Bangalore',
  p_state         text DEFAULT 'Karnataka',
  p_postal_code   text DEFAULT '',
  p_country       text DEFAULT 'IN',
  p_is_default    boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_id uuid;
  v_has_addresses boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM ecommerce.addresses WHERE customer_id = p_customer_id)
  INTO v_has_addresses;

  -- First address is always default
  IF NOT v_has_addresses THEN
    p_is_default := true;
  END IF;

  -- If setting as default, unset other defaults
  IF p_is_default THEN
    UPDATE ecommerce.addresses SET is_default = false
    WHERE customer_id = p_customer_id AND is_default = true;
  END IF;

  INSERT INTO ecommerce.addresses (
    customer_id, label, recipient_name, phone,
    address_line1, address_line2, city, state, postal_code, country, is_default
  ) VALUES (
    p_customer_id, p_label, p_recipient_name, p_phone,
    p_address_line1, p_address_line2, p_city, p_state, p_postal_code, p_country, p_is_default
  ) RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'address_id', v_id);
END;
$$;

-- 3b. Update address
CREATE OR REPLACE FUNCTION ecommerce.update_customer_address(
  p_customer_id   uuid,
  p_address_id    uuid,
  p_label         text DEFAULT NULL,
  p_recipient_name text DEFAULT NULL,
  p_phone         text DEFAULT NULL,
  p_address_line1 text DEFAULT NULL,
  p_address_line2 text DEFAULT NULL,
  p_city          text DEFAULT NULL,
  p_state         text DEFAULT NULL,
  p_postal_code   text DEFAULT NULL,
  p_country       text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
BEGIN
  UPDATE ecommerce.addresses SET
    label          = COALESCE(p_label, label),
    recipient_name = COALESCE(p_recipient_name, recipient_name),
    phone          = COALESCE(p_phone, phone),
    address_line1  = COALESCE(p_address_line1, address_line1),
    address_line2  = COALESCE(p_address_line2, address_line2),
    city           = COALESCE(p_city, city),
    state          = COALESCE(p_state, state),
    postal_code    = COALESCE(p_postal_code, postal_code),
    country        = COALESCE(p_country, country)
  WHERE id = p_address_id AND customer_id = p_customer_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'address_not_found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'address_id', p_address_id);
END;
$$;

-- 3c. Get my addresses
CREATE OR REPLACE FUNCTION ecommerce.get_my_addresses(p_customer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_addresses jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(a) ORDER BY a.is_default DESC, a.created_at), '[]'::jsonb)
  INTO v_addresses
  FROM ecommerce.addresses a
  WHERE a.customer_id = p_customer_id;

  RETURN jsonb_build_object('ok', true, 'addresses', v_addresses);
END;
$$;

-- 3d. Delete address
CREATE OR REPLACE FUNCTION ecommerce.delete_customer_address(
  p_customer_id uuid,
  p_address_id  uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_was_default boolean;
  v_other_id    uuid;
BEGIN
  SELECT is_default INTO v_was_default
  FROM ecommerce.addresses
  WHERE id = p_address_id AND customer_id = p_customer_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'address_not_found');
  END IF;

  DELETE FROM ecommerce.addresses WHERE id = p_address_id AND customer_id = p_customer_id;

  -- If deleted was default, promote the most recent remaining address
  IF v_was_default THEN
    SELECT id INTO v_other_id
    FROM ecommerce.addresses
    WHERE customer_id = p_customer_id
    ORDER BY created_at DESC LIMIT 1;

    IF v_other_id IS NOT NULL THEN
      UPDATE ecommerce.addresses SET is_default = true WHERE id = v_other_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 3e. Set default address
CREATE OR REPLACE FUNCTION ecommerce.set_default_address(
  p_customer_id uuid,
  p_address_id  uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM ecommerce.addresses WHERE id = p_address_id AND customer_id = p_customer_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'address_not_found');
  END IF;

  UPDATE ecommerce.addresses SET is_default = false
  WHERE customer_id = p_customer_id AND is_default = true;

  UPDATE ecommerce.addresses SET is_default = true
  WHERE id = p_address_id AND customer_id = p_customer_id;

  RETURN jsonb_build_object('ok', true, 'address_id', p_address_id);
END;
$$;
