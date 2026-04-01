-- =============================================================================
-- Migration: 0008_reviews.sql
-- Description: Product reviews. Customers can review products they have
--              purchased (verified_purchase flag). No IMS dependencies.
-- =============================================================================

CREATE TABLE ecommerce.reviews (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES ecommerce.products(id) ON DELETE CASCADE,
  order_item_id     uuid REFERENCES ecommerce.order_items(id) ON DELETE SET NULL,
  rating            smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             text,
  body              text,
  verified_purchase boolean NOT NULL DEFAULT false,
  status            ecommerce.review_status NOT NULL DEFAULT 'pending',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  -- One review per customer per product
  UNIQUE (customer_id, product_id)
);

CREATE INDEX idx_reviews_product  ON ecommerce.reviews (product_id);
CREATE INDEX idx_reviews_customer ON ecommerce.reviews (customer_id);
CREATE INDEX idx_reviews_status   ON ecommerce.reviews (status);
CREATE INDEX idx_reviews_rating   ON ecommerce.reviews (rating);

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON ecommerce.reviews
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- Auto-mark verified_purchase when order_item_id is provided and belongs to
-- the same customer
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.set_verified_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_item_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM ecommerce.order_items oi
      JOIN ecommerce.orders o ON o.id = oi.order_id
      WHERE oi.id = NEW.order_item_id
        AND o.customer_id = NEW.customer_id
        AND o.status IN ('delivered', 'shipped')
    ) THEN
      NEW.verified_purchase := true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_verified_purchase
  BEFORE INSERT OR UPDATE ON ecommerce.reviews
  FOR EACH ROW EXECUTE FUNCTION ecommerce.set_verified_purchase();

-- ────────────────────────────────────────────────────────────────────────────
-- Convenience view: approved reviews with aggregate ratings
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW ecommerce.product_ratings AS
SELECT
  product_id,
  COUNT(*)                              AS review_count,
  ROUND(AVG(rating)::numeric, 1)        AS average_rating,
  COUNT(*) FILTER (WHERE rating = 5)    AS five_star,
  COUNT(*) FILTER (WHERE rating = 4)    AS four_star,
  COUNT(*) FILTER (WHERE rating = 3)    AS three_star,
  COUNT(*) FILTER (WHERE rating = 2)    AS two_star,
  COUNT(*) FILTER (WHERE rating = 1)    AS one_star
FROM ecommerce.reviews
WHERE status = 'approved'
GROUP BY product_id;

COMMENT ON VIEW ecommerce.product_ratings IS
  'Pre-aggregated rating stats per product. Only counts approved reviews.';

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "public_read_approved_reviews"
  ON ecommerce.reviews FOR SELECT
  USING (status = 'approved');

-- Customers can always see their own reviews (even pending/rejected)
CREATE POLICY "customer_read_own_reviews"
  ON ecommerce.reviews FOR SELECT
  USING (customer_id = auth.uid());

-- Customers can submit reviews
CREATE POLICY "customer_insert_review"
  ON ecommerce.reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Customers can update their own pending reviews only (not after approval)
CREATE POLICY "customer_update_own_pending_review"
  ON ecommerce.reviews FOR UPDATE
  USING (customer_id = auth.uid() AND status = 'pending');

-- Customers can delete their own pending reviews
CREATE POLICY "customer_delete_own_pending_review"
  ON ecommerce.reviews FOR DELETE
  USING (customer_id = auth.uid() AND status = 'pending');

-- Admins can moderate (read/update status)
CREATE POLICY "admin_read_all_reviews"
  ON ecommerce.reviews FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_update_review_status"
  ON ecommerce.reviews FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');
