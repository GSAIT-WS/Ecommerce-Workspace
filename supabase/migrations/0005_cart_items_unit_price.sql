-- =============================================================================
-- Add unit_price to public.cart_items for price snapshot at add-to-cart time.
-- =============================================================================

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS unit_price decimal(10,2);

-- Backfill existing rows from current product price (optional)
UPDATE public.cart_items ci
SET unit_price = p.price
FROM public.products p
WHERE ci.product_id = p.id AND ci.unit_price IS NULL;

-- New rows will set unit_price on insert; allow NULL for legacy compatibility
COMMENT ON COLUMN public.cart_items.unit_price IS 'Price at time of add-to-cart (snapshot).';
