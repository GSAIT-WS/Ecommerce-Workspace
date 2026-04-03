-- =============================================================================
-- Migration: 066_check_phone_registered.sql
-- Description: Lets the login/signup pages check if a phone (E.164) exists in
--   auth.users before sending OTP — mirrors check_email_registered.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_phone_registered(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  v_norm text;
  v_exists boolean;
BEGIN
  v_norm := trim(p_phone);
  IF v_norm = '' THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.phone IS NOT NULL
      AND trim(u.phone) = v_norm
      AND (
        u.raw_app_meta_data->>'user_type' IS NULL
        OR u.raw_app_meta_data->>'user_type' <> 'ims_staff'
      )
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_phone_registered(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_phone_registered(text) TO authenticated;

COMMENT ON FUNCTION public.check_phone_registered(text) IS
  'Returns true if a customer auth user exists with this exact phone (E.164, trimmed).';
