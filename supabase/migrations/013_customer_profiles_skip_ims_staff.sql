-- =============================================================================
-- Migration: 0013_customer_profiles_skip_ims_staff.sql
-- Description: Skip inserting into ecommerce.customer_profiles when the new
--              auth user is IMS staff (user_type = 'ims_staff').
--              IMS staff belong in public.profiles only; ecommerce.customer_profiles
--              should only contain ecommerce customers.
-- =============================================================================

CREATE OR REPLACE FUNCTION ecommerce.on_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
BEGIN
  -- Skip IMS staff: they belong in public.profiles only, not ecommerce.customer_profiles
  IF (NEW.raw_app_meta_data->>'user_type' = 'ims_staff') THEN
    RETURN NEW;
  END IF;

  INSERT INTO ecommerce.customer_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION ecommerce.on_auth_user_created() IS
  'Auto-provisions a customer_profiles row when a new auth.users row is inserted, '
  'except for IMS staff (user_type = ims_staff). IMS staff use public.profiles only.';
