-- =============================================================================
-- Payment layer: payment_attempts table and process_payment_webhook RPC.
-- Supports create-payment-intent (insert attempt) and idempotent webhook handling.
--
-- Order status transitions (Phase 3):
--   pending -> confirmed   (on payment success via webhook)
--   pending -> cancelled  (manual cancel via cancel_order RPC)
--   pending -> failed     (payment failure: payment_status = failed; order status
--                         remains pending; stock is restored by process_payment_webhook)
-- =============================================================================

-- payment_attempts: one per payment intent; external_id used for webhook idempotency
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  external_id text NOT NULL UNIQUE,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  provider text NOT NULL DEFAULT 'stripe',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_order_id ON public.payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_external_id ON public.payment_attempts(external_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON public.payment_attempts(status);

COMMENT ON TABLE public.payment_attempts IS 'One record per payment intent; external_id is provider payment intent id (idempotency for webhooks).';

CREATE TRIGGER payment_attempts_updated_at
  BEFORE UPDATE ON public.payment_attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- process_payment_webhook: idempotent; updates payment_attempt + order in one transaction.
-- p_external_id = payment intent id (matches payment_attempts.external_id).
-- p_outcome = 'succeeded' | 'failed'.
CREATE OR REPLACE FUNCTION public.process_payment_webhook(
  p_external_id text,
  p_outcome text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt record;
  v_order_id uuid;
  v_item record;
BEGIN
  IF p_outcome IS NULL OR p_outcome NOT IN ('succeeded', 'failed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_outcome',
      'message', 'outcome must be succeeded or failed'
    );
  END IF;

  -- 1. Find payment attempt and lock row
  SELECT id, order_id, status
  INTO v_attempt
  FROM public.payment_attempts
  WHERE external_id = p_external_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'attempt_not_found',
      'message', 'Payment attempt not found for external_id'
    );
  END IF;

  -- Idempotency: already processed
  IF v_attempt.status IN ('succeeded', 'failed') THEN
    RETURN jsonb_build_object(
      'success', true,
      'idempotent', true,
      'message', 'Webhook already processed'
    );
  END IF;

  v_order_id := v_attempt.order_id;

  IF p_outcome = 'succeeded' THEN
    -- Update attempt
    UPDATE public.payment_attempts
    SET status = 'succeeded', updated_at = now()
    WHERE id = v_attempt.id;

    -- Update order: payment_status = paid, status = confirmed
    UPDATE public.orders
    SET payment_status = 'paid',
        status = 'confirmed',
        updated_at = now()
    WHERE id = v_order_id;

    -- Log status history
    INSERT INTO public.order_status_history (order_id, status)
    VALUES (v_order_id, 'confirmed');

    RETURN jsonb_build_object(
      'success', true,
      'order_id', v_order_id,
      'payment_status', 'paid',
      'order_status', 'confirmed',
      'message', 'Payment succeeded; order confirmed'
    );
  ELSE
    -- p_outcome = 'failed': update attempt, set order payment_status = failed, restore stock
    UPDATE public.payment_attempts
    SET status = 'failed', updated_at = now()
    WHERE id = v_attempt.id;

    UPDATE public.orders
    SET payment_status = 'failed',
        updated_at = now()
    WHERE id = v_order_id;

    -- Restore stock for each order item
    FOR v_item IN
      SELECT product_id, quantity
      FROM public.order_items
      WHERE order_id = v_order_id
    LOOP
      UPDATE public.products
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = now()
      WHERE id = v_item.product_id;
    END LOOP;

    RETURN jsonb_build_object(
      'success', true,
      'order_id', v_order_id,
      'payment_status', 'failed',
      'message', 'Payment failed; stock restored'
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.process_payment_webhook(text, text) IS
  'Idempotent webhook handler: updates payment_attempt and order (payment_status, order status, stock on failure).';
