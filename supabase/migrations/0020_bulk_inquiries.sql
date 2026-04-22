-- Leads from PDP "Request Custom Bulk Quote" (Edge Function uses service role).
CREATE TABLE IF NOT EXISTS ecommerce.bulk_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  product_id text NOT NULL,
  product_name text NOT NULL,
  name text NOT NULL,
  business text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  quantity text NOT NULL,
  message text
);

ALTER TABLE ecommerce.bulk_inquiries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE ecommerce.bulk_inquiries IS
  'B2B bulk quote requests from the storefront; inserted only via Edge Functions (service role).';
