-- =============================================================================
-- Migration: 074_customer_profiles_store_only.sql
-- Description: Long-term rule — ecommerce.customer_profiles only exists for
--   store customers, not for every auth.users row.
--
--   • raw_app_meta_data.user_type = 'ims_staff'  → never get a profile (trigger
--     + ensure_customer_profile skip). IMS provisioning scripts / Edge should
--     always set this tag.
--   • raw_app_meta_data.user_type = 'ecommerce_customer' OR NULL → may get a
--     profile (store signups; NULL = legacy consumers before explicit tagging).
--   • Any other explicit user_type → no profile (internal / future roles).
--
-- Safety net: DELETE any customer_profiles rows tied to IMS staff (or other
-- non-store explicit types) so a stale mirror or old trigger cannot leave IMS
-- rows in Table Editor after deploy.
--
-- Depends: auth.users.raw_app_meta_data JSON (Supabase app_metadata).
-- =============================================================================

-- ── 1. Safety-net cleanup ────────────────────────────────────────────────────
DELETE FROM ecommerce.customer_profiles cp
USING auth.users u
WHERE cp.id = u.id
  AND (
    u.raw_app_meta_data->>'user_type' = 'ims_staff'
    OR (
      u.raw_app_meta_data->>'user_type' IS NOT NULL
      AND u.raw_app_meta_data->>'user_type' IS DISTINCT FROM 'ecommerce_customer'
    )
  );

-- ── 2. Trigger: only insert for store-eligible auth users ───────────────────
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

  INSERT INTO ecommerce.customer_profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION ecommerce.on_auth_user_created() IS
  'Inserts ecommerce.customer_profiles only for store customers: '
  'user_type is NULL (legacy) or ecommerce_customer. Skips ims_staff and any '
  'other explicit non-store user_type. Migration 074.';

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ecommerce.on_auth_user_created();

-- ── 3. ensure_customer_profile (frontend fallback) ───────────────────────────
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

  INSERT INTO ecommerce.customer_profiles (id, full_name, email)
  SELECT
    u.id,
    u.raw_user_meta_data->>'full_name',
    u.email
  FROM auth.users u
  WHERE u.id = auth.uid()
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email
    WHERE ecommerce.customer_profiles.email IS NULL;
END;
$$;

COMMENT ON FUNCTION public.ensure_customer_profile() IS
  'Idempotent: creates customer_profiles for the caller only when user_type is '
  'NULL or ecommerce_customer; never for ims_staff or other explicit non-store '
  'types. Migration 074.';

-- ── 4. is_ecommerce_customer — align with store-only rule ────────────────────
CREATE OR REPLACE FUNCTION public.is_ecommerce_customer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
DECLARE
  v_uid         uuid;
  v_type        text;
  v_has_profile boolean := false;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
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
    SELECT 1 FROM ecommerce.customer_profiles WHERE id = v_uid
  ) INTO v_has_profile;

  RETURN v_has_profile;
END;
$$;

COMMENT ON FUNCTION public.is_ecommerce_customer() IS
  'True when the caller is allowed as a store customer: not ims_staff, '
  'user_type is NULL or ecommerce_customer, and a customer_profiles row exists. '
  'Migration 074.';

GRANT EXECUTE ON FUNCTION public.ensure_customer_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_ecommerce_customer() TO authenticated;
