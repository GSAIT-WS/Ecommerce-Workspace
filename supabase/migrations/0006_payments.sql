-- =============================================================================
-- Migration: 0006_payments.sql
-- Description: Payment attempts + idempotent webhook handler.
--              Ecommerce fully owns payments, webhooks, and refunds.
--              No IMS table dependencies.
--
-- Stock ownership note:
--   On payment failure the webhook handler transitions the order to cancelled
--   but does NOT touch ecommerce.stock_levels (IMS owns stock).
--   The Edge Function must call ims_release_ecommerce_stock() after this
--   returns a failed status, using the order's line items.
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Payment attempts
-- One row per payment intent / provider transaction.
-- external_id is the provider's payment intent ID (idempotency key).
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.payment_attempts (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid    NOT NULL REFERENCES ecommerce.orders(id) ON DELETE RESTRICT,
  external_id       text    NOT NULL UNIQUE,   -- provider payment intent ID
  provider          text    NOT NULL DEFAULT 'stripe',
  amount            numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency          text    NOT NULL DEFAULT 'INR',
  status            ecommerce.payment_status NOT NULL DEFAULT 'pending',
  failure_reason    text,
  provider_response jsonb,                     -- raw webhook payload (sanitised)
  refund_amount     numeric(12, 2)             CHECK (refund_amount >= 0),
  refunded_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_order    ON ecommerce.payment_attempts (order_id);
CREATE INDEX idx_payment_external ON ecommerce.payment_attempts (external_id);
CREATE INDEX idx_payment_status   ON ecommerce.payment_attempts (status);

CREATE TRIGGER trg_payment_attempts_updated_at
  BEFORE UPDATE ON ecommerce.payment_attempts
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- process_payment_webhook  — idempotent handler
--
-- Called by the payment-webhook Edge Function with a verified provider event.
-- Uses external_id as the idempotency key; safe to call multiple times.
--
-- On success  → order: pending → confirmed
-- On failure  → order: pending → cancelled
--              (Edge Function then calls ims_release_ecommerce_stock()
--               using the returned ims_release_items list)
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
  v_attempt ecommerce.payment_attempts%ROWTYPE;
  v_order   ecommerce.orders%ROWTYPE;
BEGIN
  -- Lock the payment attempt to prevent concurrent webhook replays
  SELECT * INTO v_attempt
  FROM ecommerce.payment_attempts
  WHERE external_id = p_external_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'payment_attempt_not_found');
  END IF;

  -- Idempotency: already processed to a terminal state
  IF v_attempt.status IN ('succeeded', 'failed', 'refunded') THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'status', v_attempt.status);
  END IF;

  SELECT * INTO v_order
  FROM ecommerce.orders
  WHERE id = v_attempt.order_id
  FOR UPDATE;

  -- Update payment attempt record
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

    -- Return line items so Edge Function can call ims_release_ecommerce_stock()
    -- IMS owns the stock reservation release — do NOT touch ecommerce.stock_levels here.
    RETURN jsonb_build_object(
      'ok',       true,
      'status',   'failed',
      'order_id', v_order.id,
      'ims_release_items', (
        SELECT jsonb_agg(jsonb_build_object(
                 'sku',      oi.product_external_id,
                 'quantity', oi.quantity
               ))
        FROM ecommerce.order_items oi
        WHERE oi.order_id = v_order.id
          AND oi.item_type = 'product'
          AND oi.product_external_id IS NOT NULL
      )
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', p_status, 'order_id', v_order.id);
END;
$$;

COMMENT ON FUNCTION ecommerce.process_payment_webhook IS
  'Idempotent payment webhook handler. Uses external_id for deduplication. '
  'On failure: cancels order and returns ims_release_items for the Edge Function '
  'to call ims_release_ecommerce_stock() on the IMS DB. '
  'No stock mutations in this function — IMS owns all stock state.';

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_select_own_payments"
  ON ecommerce.payment_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ecommerce.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

CREATE POLICY "admin_select_all_payments"
  ON ecommerce.payment_attempts FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
