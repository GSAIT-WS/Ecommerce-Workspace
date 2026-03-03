-- =============================================================================
-- create_online_order: single-transaction order creation from cart
-- Prerequisites: ecommerce.cart, ecommerce.cart_items, ecommerce.online_orders,
--   ecommerce.online_order_items, public.customers, public.products,
--   main_branch.coupons, and IMS inventory.
-- Expected:
--   main_branch.coupons: id, code, discount_type ('percent'|'fixed'), discount_value,
--                        valid_from, valid_to (timestamptz, nullable).
--   ims.inventory: product_id (PK), quantity_available (int). Adjust if your
--   IMS uses different table/column names (e.g. branch_id).
-- =============================================================================

-- Ensure tables exist (minimal structure). Skip if you already have these.
-- Uncomment and adjust if your project does not yet have these tables.
/*
CREATE TABLE IF NOT EXISTS ecommerce.cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES ecommerce.cart(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce.online_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  subtotal numeric(12,2) NOT NULL,
  discount_amount numeric(12,2) NOT NULL DEFAULT 0,
  shipping_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  coupon_id uuid REFERENCES main_branch.coupons(id),
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecommerce.online_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES ecommerce.online_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  product_name text,
  created_at timestamptz DEFAULT now()
);

CREATE SCHEMA IF NOT EXISTS ims;
CREATE TABLE IF NOT EXISTS ims.inventory (
  product_id uuid PRIMARY KEY REFERENCES public.products(id),
  quantity_available int NOT NULL DEFAULT 0 CHECK (quantity_available >= 0)
);
*/

-- RPC: create online order from cart (all steps in one transaction)
CREATE OR REPLACE FUNCTION ecommerce.create_online_order(
  p_customer_id uuid,
  p_cart_id uuid,
  p_coupon_code text DEFAULT NULL,
  p_shipping_amount numeric DEFAULT 0,
  p_shipping_address jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, ecommerce, main_branch, ims
AS $$
DECLARE
  v_cart_rec record;
  v_item record;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric;
  v_total numeric;
  v_order_id uuid;
  v_coupon_rec record;
  v_coupon_id uuid := NULL;
  v_avail int;
BEGIN
  v_shipping := COALESCE(NULLIF(p_shipping_amount, 0), 0);
  IF v_shipping < 0 THEN
    v_shipping := 0;
  END IF;

  -- 1. Customer exists
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = p_customer_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'customer_not_found',
      'message', 'Customer does not exist'
    );
  END IF;

  -- 2. Cart exists and belongs to customer
  SELECT c.id, c.customer_id INTO v_cart_rec
  FROM ecommerce.cart c
  WHERE c.id = p_cart_id AND c.customer_id = p_customer_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'cart_not_found',
      'message', 'Cart not found or does not belong to customer'
    );
  END IF;

  -- 3. Cart has items and compute subtotal; check stock for each
  FOR v_item IN
    SELECT ci.product_id, ci.quantity, ci.unit_price, p.name AS product_name
    FROM ecommerce.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.cart_id = p_cart_id
  LOOP
    v_subtotal := v_subtotal + (v_item.quantity * v_item.unit_price);

    -- Stock check (ims.inventory: product_id, quantity_available)
    SELECT quantity_available INTO v_avail
    FROM ims.inventory
    WHERE product_id = v_item.product_id;
    v_avail := COALESCE(v_avail, 0);
    IF v_avail < v_item.quantity THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'insufficient_stock',
        'message', 'Insufficient stock for product ' || v_item.product_id,
        'product_id', v_item.product_id,
        'requested', v_item.quantity,
        'available', v_avail
      );
    END IF;
  END LOOP;

  IF v_subtotal <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'cart_empty',
      'message', 'Cart has no items'
    );
  END IF;

  -- 4. Coupon (main_branch.coupons: code, discount_type, discount_value, valid_from, valid_to, id)
  IF p_coupon_code IS NOT NULL AND btrim(p_coupon_code) != '' THEN
    SELECT id, discount_type, discount_value, valid_from, valid_to
    INTO v_coupon_rec
    FROM main_branch.coupons
    WHERE code = btrim(p_coupon_code)
      AND (valid_from IS NULL OR valid_from <= now())
      AND (valid_to IS NULL OR valid_to >= now())
    LIMIT 1;
    IF FOUND THEN
      v_coupon_id := v_coupon_rec.id;
      IF v_coupon_rec.discount_type = 'percent' THEN
        v_discount := LEAST(v_subtotal, (v_subtotal * v_coupon_rec.discount_value / 100));
      ELSIF v_coupon_rec.discount_type = 'fixed' THEN
        v_discount := LEAST(v_subtotal, v_coupon_rec.discount_value);
      END IF;
    END IF;
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

  -- 5. Insert order
  INSERT INTO ecommerce.online_orders (
    customer_id, subtotal, discount_amount, shipping_amount, total,
    status, coupon_id, shipping_address
  )
  VALUES (
    p_customer_id, v_subtotal, v_discount, v_shipping, v_total,
    'pending',
    v_coupon_id,
    p_shipping_address
  )
  RETURNING id INTO v_order_id;

  -- 6. Insert order items and deduct stock
  FOR v_item IN
    SELECT ci.product_id, ci.quantity, ci.unit_price, p.name AS product_name
    FROM ecommerce.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.cart_id = p_cart_id
  LOOP
    INSERT INTO ecommerce.online_order_items (order_id, product_id, quantity, unit_price, product_name)
    VALUES (v_order_id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item.product_name);

    UPDATE ims.inventory
    SET quantity_available = quantity_available - v_item.quantity
    WHERE product_id = v_item.product_id;
  END LOOP;

  -- 7. Clear cart
  DELETE FROM ecommerce.cart_items WHERE cart_id = p_cart_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'shipping_amount', v_shipping,
    'total', v_total
  );
END;
$$;

COMMENT ON FUNCTION ecommerce.create_online_order(uuid, uuid, text, numeric, jsonb) IS
  'Creates an online order from cart; validates customer, cart, stock; applies coupon; deducts IMS inventory; clears cart. All in one transaction.';
