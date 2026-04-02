-- =============================================================================
-- Migration: 0005_orders.sql
-- Description: Order lifecycle — orders, line items, status history.
--              Ecommerce fully owns this domain. No IMS table dependencies.
--              pricing_snapshot and discount_snapshot ensure historical orders
--              remain stable even if IMS changes prices/discounts later.
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Orders
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number         text NOT NULL UNIQUE DEFAULT ecommerce.generate_order_number(),
  customer_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status               ecommerce.order_status NOT NULL DEFAULT 'pending',
  shipping_address_id  uuid REFERENCES ecommerce.addresses(id) ON DELETE SET NULL,

  -- Financials (all in base currency, no rounding until final total)
  subtotal             numeric(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_amount      numeric(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  shipping_amount      numeric(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  tax_amount           numeric(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount         numeric(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),

  -- Coupon applied (denormalised code for display; rule stored in snapshots)
  coupon_code          text,

  -- Immutable snapshots: pricing and discount state at order-placement time.
  -- These guarantee historical orders are never mutated by future IMS changes.
  pricing_snapshot     jsonb,   -- { items: [{sku, name, unit_price, qty}] }
  discount_snapshot    jsonb,   -- { coupon_code, rule_type, discount_value, amount_saved }

  -- Shipping
  shipping_address_snapshot jsonb,  -- denormalised copy of address at placement

  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer   ON ecommerce.orders (customer_id);
CREATE INDEX idx_orders_status     ON ecommerce.orders (status);
CREATE INDEX idx_orders_created    ON ecommerce.orders (created_at DESC);
CREATE INDEX idx_orders_number     ON ecommerce.orders (order_number);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON ecommerce.orders
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON COLUMN ecommerce.orders.pricing_snapshot IS
  'JSON snapshot of prices at order time. Immutable after insertion. '
  'Source of truth for any refund/dispute calculations.';

COMMENT ON COLUMN ecommerce.orders.discount_snapshot IS
  'JSON snapshot of the applied discount rule at order time. Immutable.';

-- ────────────────────────────────────────────────────────────────────────────
-- Order items
-- Denormalise key product fields so order history is stable.
-- product_external_id / sku are the stable cross-system identifiers used
-- when sending order_placed events to IMS.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.order_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid NOT NULL REFERENCES ecommerce.orders(id) ON DELETE CASCADE,
  item_type             ecommerce.item_type NOT NULL DEFAULT 'product',

  -- Live FKs (nullable: product may be archived, but order history persists)
  product_id            uuid REFERENCES ecommerce.products(id) ON DELETE SET NULL,
  combo_id              uuid REFERENCES ecommerce.combos(id)   ON DELETE SET NULL,

  -- Stable cross-system keys for IMS event emission
  product_external_id   text,
  sku                   text,

  -- Denormalised snapshot fields (stable regardless of future IMS updates)
  name_snapshot         text NOT NULL,
  unit_price            numeric(12, 2) NOT NULL CHECK (unit_price >= 0),
  quantity              integer        NOT NULL CHECK (quantity > 0),
  line_total            numeric(12, 2) NOT NULL CHECK (line_total >= 0),

  -- Combo expansion details if item_type = 'combo'
  combo_details_json    jsonb,

  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order   ON ecommerce.order_items (order_id);
CREATE INDEX idx_order_items_product ON ecommerce.order_items (product_id);
CREATE INDEX idx_order_items_sku     ON ecommerce.order_items (sku);

-- ────────────────────────────────────────────────────────────────────────────
-- Order status history  (append-only audit trail)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.order_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES ecommerce.orders(id) ON DELETE CASCADE,
  old_status  ecommerce.order_status,
  new_status  ecommerce.order_status NOT NULL,
  changed_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- null = system
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_history_order ON ecommerce.order_status_history (order_id);

COMMENT ON TABLE ecommerce.order_status_history IS
  'Append-only audit trail. Rows are never updated or deleted.';

-- Auto-log status changes
CREATE OR REPLACE FUNCTION ecommerce.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ecommerce.order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_status_history
  AFTER UPDATE OF status ON ecommerce.orders
  FOR EACH ROW EXECUTE FUNCTION ecommerce.log_order_status_change();

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.order_status_history ENABLE ROW LEVEL SECURITY;

-- Customers see only their own orders
CREATE POLICY "customer_select_own_orders"
  ON ecommerce.orders FOR SELECT
  USING (customer_id = auth.uid());

-- Orders are created by the place_order RPC (SECURITY DEFINER); no direct
-- customer INSERT to prevent bypassing business logic.

-- Customers can request cancellation (status update) on pending orders only.
-- The actual transition is handled by the cancel_order RPC.
-- No direct UPDATE policy for authenticated role to prevent status spoofing.

-- Customers see their own order items
CREATE POLICY "customer_select_own_order_items"
  ON ecommerce.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ecommerce.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

-- Customers see their own order history
CREATE POLICY "customer_select_own_order_history"
  ON ecommerce.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ecommerce.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

-- Admins can read and update all orders
CREATE POLICY "admin_select_all_orders"
  ON ecommerce.orders FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_update_all_orders"
  ON ecommerce.orders FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_select_all_order_items"
  ON ecommerce.order_items FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_select_all_order_history"
  ON ecommerce.order_status_history FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
