-- =============================================================================
-- Migration: 067_profile_rpcs.sql
-- Description: Public RPC functions so the frontend can read and update the
--   authenticated user's ecommerce.customer_profiles row without needing the
--   ecommerce schema exposed in PostgREST.
-- =============================================================================

-- ── 1. get_my_profile ─────────────────────────────────────────────────────────
-- Returns the customer_profiles row for auth.uid().
-- Returns empty result set (no rows) if the profile doesn't exist yet.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id           uuid,
  full_name    text,
  email        text,
  phone        text,
  avatar_url   text,
  date_of_birth date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.full_name,
    cp.email,
    cp.phone,
    cp.avatar_url,
    cp.date_of_birth
  FROM ecommerce.customer_profiles cp
  WHERE cp.id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

COMMENT ON FUNCTION public.get_my_profile() IS
  'Returns the ecommerce.customer_profiles row for the currently authenticated user.';

-- ── 2. update_my_profile ──────────────────────────────────────────────────────
-- Updates full_name and phone for auth.uid().
-- Email is managed by Supabase Auth (auth.users.email) and is not editable here.
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_full_name text,
  p_phone     text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
BEGIN
  UPDATE ecommerce.customer_profiles
  SET
    full_name  = p_full_name,
    phone      = p_phone,
    updated_at = now()
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_my_profile(text, text) TO authenticated;

COMMENT ON FUNCTION public.update_my_profile(text, text) IS
  'Updates full_name and phone on the ecommerce.customer_profiles row for the '
  'currently authenticated user. Email is read-only (managed by Supabase Auth).';
