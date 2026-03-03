-- =============================================================================
-- place_order: create order from user's cart (blueprint flow)
-- Uses public.users, public.cart_items, public.products, public.orders,
-- public.order_items. Stock in products.stock_quantity; atomic decrement.
-- All in one transaction.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id uuid,
  p_shipping_address jsonb,
  p_discount_type public.discount_type DEFAULT 'none',
  p_discount_amount numeric DEFAULT 0,
  p_shipping_amount numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item record;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric;
  v_total numeric;
  v_order_id uuid;
  v_line_total numeric;
  v_avail int;
BEGIN
  v_shipping := GREATEST(0, COALESCE(p_shipping_amount, 0));
  v_discount := GREATEST(0, COALESCE(p_discount_amount, 0));

  -- 1. User exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'user_not_found',
      'message', 'User does not exist'
    );
  END IF;

  -- 2. Cart has items; lock product rows and check stock (concurrency-safe)
  FOR v_item IN
    SELECT ci.product_id, ci.quantity, p.price AS unit_price, p.name AS product_name, p.is_active, p.stock_quantity
    FROM public.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.user_id = p_user_id
    FOR UPDATE OF p
  LOOP
    IF NOT COALESCE(v_item.is_active, true) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'product_inactive',
        'message', 'Product no longer available: ' || COALESCE(v_item.product_name, v_item.product_id::text),
        'product_id', v_item.product_id
      );
    END IF;

    v_subtotal := v_subtotal + (v_item.quantity * v_item.unit_price);

    -- Stock check (row already locked by FOR UPDATE OF p)
    v_avail := COALESCE(v_item.stock_quantity, 0);
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

  -- Cap discount at subtotal
  v_discount := LEAST(v_discount, v_subtotal);
  v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

  -- 3. Insert order
  INSERT INTO public.orders (
    user_id, status, subtotal, discount_amount, total,
    discount_type, shipping_address, payment_status
  )
  VALUES (
    p_user_id, 'pending', v_subtotal, v_discount, v_total,
    p_discount_type, p_shipping_address, 'pending'
  )
  RETURNING id INTO v_order_id;

  -- 4. Insert order_items and atomically decrement stock
  FOR v_item IN
    SELECT ci.product_id, ci.quantity, p.price AS unit_price, p.name AS product_name
    FROM public.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.user_id = p_user_id
  LOOP
    v_line_total := v_item.quantity * v_item.unit_price;
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, discount_applied, line_total)
    VALUES (v_order_id, v_item.product_id, v_item.quantity, v_item.unit_price, 0, v_line_total);

    -- Atomic stock decrement (prevents overselling; row locked by UPDATE)
    UPDATE public.products
    SET stock_quantity = stock_quantity - v_item.quantity,
        updated_at = now()
    WHERE id = v_item.product_id
      AND stock_quantity >= v_item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_stock at commit for product %', v_item.product_id;
    END IF;
  END LOOP;

  -- 5. Clear cart
  DELETE FROM public.cart_items WHERE user_id = p_user_id;

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

COMMENT ON FUNCTION public.place_order(uuid, jsonb, public.discount_type, numeric, numeric) IS
  'Blueprint: place order from user cart; validate user/cart/stock; insert order + order_items; decrement products.stock_quantity; clear cart. Single transaction.';
