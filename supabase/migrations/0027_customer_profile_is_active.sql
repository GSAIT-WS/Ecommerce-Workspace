-- =============================================================================
-- Migration: 0027_customer_profile_is_active.sql
-- Description:
--   Adds ecommerce.customer_profiles.is_active and enforces active-customer
--   access checks for ecommerce login sessions.
--
-- Flow:
--   1) New auth users get a customer_profiles row with is_active = false.
--   2) Once a user has a valid authenticated session (OTP verified / Google /
--      confirmed-password flow), frontend calls activate_customer_profile().
--   3) is_ecommerce_customer() only returns true when profile exists and
--      is_active = true.
-- =============================================================================

-- 1) Schema change
ALTER TABLE ecommerce.customer_profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN ecommerce.customer_profiles.is_active IS
  'Customer access flag for ecommerce app. false on profile creation; true after verified auth flow.';

-- 2) Keep trigger behavior aligned (new profiles start inactive)
CREATE OR REPLACE FUNCTION ecommerce.on_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
DECLARE
  v_type text;
BEGIN
  v_type := NEW.raw_app_meta_data->>'user_type';

  IF v_type = 'ims_staff' THEN
    RETURN NEW;
  END IF;

  IF v_type IS NOT NULL AND v_type IS DISTINCT FROM 'ecommerce_customer' THEN
    RETURN NEW;
  END IF;

  INSERT INTO ecommerce.customer_profiles (id, full_name, email, is_active)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    false
  )
  ON CONFLICT (id) DO UPDATE
    SET email = COALESCE(ecommerce.customer_profiles.email, EXCLUDED.email);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION ecommerce.on_auth_user_created() IS
  'Inserts ecommerce.customer_profiles only for store customers (NULL/ecommerce_customer). '
  'Profiles are created inactive and activated after verified auth.';

-- 3) ensure_customer_profile still idempotent, but guarantees inactive default
CREATE OR REPLACE FUNCTION public.ensure_customer_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
DECLARE
  v_type text;
BEGIN
  SELECT u.raw_app_meta_data->>'user_type'
  INTO v_type
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF v_type = 'ims_staff' THEN
    RETURN;
  END IF;

  IF v_type IS NOT NULL AND v_type IS DISTINCT FROM 'ecommerce_customer' THEN
    RETURN;
  END IF;

  INSERT INTO ecommerce.customer_profiles (id, full_name, email, is_active)
  SELECT
    u.id,
    u.raw_user_meta_data->>'full_name',
    u.email,
    false
  FROM auth.users u
  WHERE u.id = auth.uid()
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email
    WHERE ecommerce.customer_profiles.email IS NULL;
END;
$$;

COMMENT ON FUNCTION public.ensure_customer_profile() IS
  'Idempotent customer profile creator for store users only. Creates inactive profile if missing.';

-- 4) Activation RPC (called after successful verified sign-in)
CREATE OR REPLACE FUNCTION public.activate_customer_profile()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
DECLARE
  v_type text;
  v_updated integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT u.raw_app_meta_data->>'user_type'
  INTO v_type
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF COALESCE(v_type, '') = 'ims_staff' THEN
    RETURN false;
  END IF;

  IF v_type IS NOT NULL AND v_type IS DISTINCT FROM 'ecommerce_customer' THEN
    RETURN false;
  END IF;

  UPDATE ecommerce.customer_profiles
  SET is_active = true,
      updated_at = now()
  WHERE id = auth.uid()
    AND is_active = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0 OR EXISTS (
    SELECT 1
    FROM ecommerce.customer_profiles
    WHERE id = auth.uid()
      AND is_active = true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_customer_profile() TO authenticated;

COMMENT ON FUNCTION public.activate_customer_profile() IS
  'Marks the caller customer_profiles row as active for store-eligible users.';

-- 5) Guard now requires active profile
CREATE OR REPLACE FUNCTION public.is_ecommerce_customer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
DECLARE
  v_uid        uuid;
  v_type       text;
  v_has_active boolean := false;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Explicit auth.users existence check for defense-in-depth.
  IF NOT EXISTS (
    SELECT 1
    FROM auth.users u0
    WHERE u0.id = v_uid
  ) THEN
    RETURN false;
  END IF;

  SELECT u.raw_app_meta_data->>'user_type'
  INTO v_type
  FROM auth.users u
  WHERE u.id = v_uid;

  IF COALESCE(v_type, '') = 'ims_staff' THEN
    RETURN false;
  END IF;

  IF v_type IS NOT NULL AND v_type IS DISTINCT FROM 'ecommerce_customer' THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM ecommerce.customer_profiles cp
    WHERE cp.id = v_uid
      AND cp.is_active = true
  ) INTO v_has_active;

  RETURN v_has_active;
END;
$$;

COMMENT ON FUNCTION public.is_ecommerce_customer() IS
  'True only when caller exists in auth.users and has active ecommerce.customer_profiles row.';
