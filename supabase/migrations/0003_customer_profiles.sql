-- =============================================================================
-- Migration: 0003_customer_profiles.sql
-- Description: Customer identity layer. Keyed off Supabase Auth (auth.users).
--              No custom password storage. No IMS table dependencies.
-- Auth rule: every customer row MUST reference auth.users(id).
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Customer profiles
-- One row per authenticated user. Created on first sign-in via trigger or
-- application logic. id == auth.users.id (no surrogate key needed).
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.customer_profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  avatar_url      text,
  date_of_birth   date,
  -- default_address_id set after addresses are created (circular FK deferred)
  default_address_id uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON ecommerce.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

COMMENT ON TABLE ecommerce.customer_profiles IS
  'Extended profile for authenticated customers. id = auth.users.id. '
  'No password_hash or credentials stored here — auth is handled by Supabase Auth.';

-- ────────────────────────────────────────────────────────────────────────────
-- Addresses
-- Multiple shipping/billing addresses per customer.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label           text NOT NULL DEFAULT 'Home',   -- 'Home' | 'Work' | custom
  recipient_name  text NOT NULL,
  phone           text NOT NULL,
  address_line1   text NOT NULL,
  address_line2   text,
  city            text NOT NULL,
  state           text NOT NULL,
  postal_code     text NOT NULL,
  country         text NOT NULL DEFAULT 'IN',
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_customer ON ecommerce.addresses (customer_id);

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON ecommerce.addresses
  FOR EACH ROW EXECUTE FUNCTION ecommerce.handle_updated_at();

-- Close the deferred circular FK: customer_profiles.default_address_id → addresses
ALTER TABLE ecommerce.customer_profiles
  ADD CONSTRAINT fk_default_address
  FOREIGN KEY (default_address_id)
  REFERENCES ecommerce.addresses(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- ────────────────────────────────────────────────────────────────────────────
-- Auto-create profile row when a new Supabase Auth user signs up
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.on_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
BEGIN
  INSERT INTO ecommerce.customer_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ecommerce.on_auth_user_created();

COMMENT ON FUNCTION ecommerce.on_auth_user_created() IS
  'Auto-provisions a customer_profiles row whenever a new auth.users row is '
  'inserted. Runs as SECURITY DEFINER so it can write across schemas.';

-- ────────────────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce.addresses         ENABLE ROW LEVEL SECURITY;

-- Customers can only read/update their own profile
CREATE POLICY "customer_select_own_profile"
  ON ecommerce.customer_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "customer_update_own_profile"
  ON ecommerce.customer_profiles FOR UPDATE
  USING (id = auth.uid());

-- Profile row is created by the trigger (service_role); no INSERT policy for
-- authenticated role to prevent duplicates.

-- Customers own their addresses
CREATE POLICY "customer_select_own_addresses"
  ON ecommerce.addresses FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "customer_insert_own_address"
  ON ecommerce.addresses FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "customer_update_own_address"
  ON ecommerce.addresses FOR UPDATE
  USING (customer_id = auth.uid());

CREATE POLICY "customer_delete_own_address"
  ON ecommerce.addresses FOR DELETE
  USING (customer_id = auth.uid());

-- Admin read-all (explicit; no broad authenticated access)
CREATE POLICY "admin_read_all_profiles"
  ON ecommerce.customer_profiles FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "admin_read_all_addresses"
  ON ecommerce.addresses FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
