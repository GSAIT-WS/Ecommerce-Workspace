-- =============================================================================
-- order_status_history: track status changes for orders (read/cancel phase).
-- shipping_amount on orders: store shipping for display (place_order can set it).
-- =============================================================================

-- Store shipping amount on order (place_order already computes it; optional backfill)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_amount decimal(10,2) DEFAULT 0;

COMMENT ON COLUMN public.orders.shipping_amount IS 'Shipping amount at time of order (0 if not set).';

-- Status history for orders (used by cancel-order and get-order-by-id)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON public.order_status_history(order_id);

COMMENT ON TABLE public.order_status_history IS 'History of order status changes for audit and display.';

-- =============================================================================
-- cancel_order: cancel order (pending/confirmed only), restore stock, log history.
-- Caller must verify ownership before calling; RPC checks user_id and status.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_user_id uuid,
  p_order_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_item record;
  v_allowed boolean;
BEGIN
  -- 1. Fetch order and verify ownership
  SELECT id, user_id, status
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'order_not_found',
      'message', 'Order not found'
    );
  END IF;

  IF v_order.user_id IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'forbidden',
      'message', 'Order does not belong to user'
    );
  END IF;

  v_allowed := v_order.status IN ('pending', 'confirmed');
  IF NOT v_allowed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_status',
      'message', 'Order can only be cancelled when status is pending or confirmed',
      'current_status', v_order.status
    );
  END IF;

  -- 2. Restore stock for each order item
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE public.products
    SET stock_quantity = stock_quantity + v_item.quantity,
        updated_at = now()
    WHERE id = v_item.product_id;
  END LOOP;

  -- 3. Update order status
  UPDATE public.orders
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_order_id;

  -- 4. Insert status history
  INSERT INTO public.order_status_history (order_id, status)
  VALUES (p_order_id, 'cancelled');

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'message', 'Order cancelled'
  );
END;
$$;

COMMENT ON FUNCTION public.cancel_order(uuid, uuid) IS
  'Cancels order if pending/confirmed; restores products.stock_quantity; inserts order_status_history. Caller must pass owning user_id.';
