-- =============================================================================
-- Migration: 0004_cart.sql
-- Description: Shopping cart — one cart per customer (auto-created on demand).
--              Supports individual products and combos. No IMS dependencies.
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Cart  (one active cart per customer)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.cart (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_customer ON ecommerce.cart (customer_id);

CREATE TRIGGER trg_cart_updated_at
  BEFORE UPDATE ON ecommerce.cart
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Cart items
-- Either product_id OR combo_id must be set, never both (enforced by CHECK).
-- unit_price_snapshot captures the price at add-to-cart time.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.cart_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id               uuid NOT NULL REFERENCES ecommerce.cart(id) ON DELETE CASCADE,
  item_type             ecommerce.item_type NOT NULL DEFAULT 'product',
  product_id            uuid REFERENCES ecommerce.products(id) ON DELETE CASCADE,
  combo_id              uuid REFERENCES ecommerce.combos(id)   ON DELETE CASCADE,
  quantity              integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_snapshot   numeric(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  customization_json    jsonb,      -- combo customization choices, future use
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  -- Exactly one of product_id or combo_id must be set
  CONSTRAINT chk_cart_item_type CHECK (
    (item_type = 'product' AND product_id IS NOT NULL AND combo_id IS NULL) OR
    (item_type = 'combo'   AND combo_id   IS NOT NULL AND product_id IS NULL)
  ),
  -- One row per (cart, product) and one row per (cart, combo) — no duplicates
  UNIQUE NULLS NOT DISTINCT (cart_id, product_id),
  UNIQUE NULLS NOT DISTINCT (cart_id, combo_id)
);

CREATE INDEX idx_cart_items_cart    ON ecommerce.cart_items (cart_id);
CREATE INDEX idx_cart_items_product ON ecommerce.cart_items (product_id);
CREATE INDEX idx_cart_items_combo   ON ecommerce.cart_items (combo_id);

CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON ecommerce.cart_items
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Helper: get-or-create cart for the calling user
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.get_or_create_cart(p_customer_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_cart_id uuid;
BEGIN
  SELECT id INTO v_cart_id
  FROM ecommerce.cart
  WHERE customer_id = p_customer_id;

  IF v_cart_id IS NULL THEN
    INSERT INTO ecommerce.cart (customer_id)
    VALUES (p_customer_id)
    RETURNING id INTO v_cart_id;
  END IF;

  RETURN v_cart_id;
END;
$$;

COMMENT ON FUNCTION ecommerce.get_or_create_cart(uuid) IS
  'Idempotent: returns existing cart id or creates a new one for the customer.';

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.cart       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart: customers own exactly their own row
CREATE POLICY "customer_select_own_cart"
  ON ecommerce.cart FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "customer_insert_own_cart"
  ON ecommerce.cart FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "customer_update_own_cart"
  ON ecommerce.cart FOR UPDATE
  USING (customer_id = auth.uid());

CREATE POLICY "customer_delete_own_cart"
  ON ecommerce.cart FOR DELETE
  USING (customer_id = auth.uid());

-- Cart items: customer accesses items through their own cart
CREATE POLICY "customer_select_own_cart_items"
  ON ecommerce.cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ecommerce.cart c
      WHERE c.id = cart_id AND c.customer_id = auth.uid()
    )
  );

CREATE POLICY "customer_insert_own_cart_items"
  ON ecommerce.cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ecommerce.cart c
      WHERE c.id = cart_id AND c.customer_id = auth.uid()
    )
  );

CREATE POLICY "customer_update_own_cart_items"
  ON ecommerce.cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ecommerce.cart c
      WHERE c.id = cart_id AND c.customer_id = auth.uid()
    )
  );

CREATE POLICY "customer_delete_own_cart_items"
  ON ecommerce.cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ecommerce.cart c
      WHERE c.id = cart_id AND c.customer_id = auth.uid()
    )
  );
