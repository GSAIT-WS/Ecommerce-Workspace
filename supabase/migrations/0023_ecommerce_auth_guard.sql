-- =============================================================================
-- Migration: 068_ecommerce_auth_guard.sql
-- Description: Prevents IMS staff (and any non-customer auth.users row) from
--   being treated as ecommerce customers.
--
-- Problem:
--   auth.users is shared between the ecommerce app and the IMS. Any valid
--   Supabase session satisfies supabase.auth.signIn(), so IMS staff can
--   technically sign in to the ecommerce frontend (and vice-versa) even though
--   they have no legitimate access there.
--
-- Fix (two parts):
--   1. Patch ensure_customer_profile() so it refuses to create a
--      customer_profiles row for IMS staff accounts. Prevents the accidental
--      auto-provisioning that currently lets IMS staff "sneak in".
--
--   2. New RPC is_ecommerce_customer() — called by the frontend immediately
--      after every successful sign-in. Returns false for IMS staff or any
--      user that has no customer_profiles row. The frontend signs them out
--      and shows an error if this returns false.
-- =============================================================================

-- ── 1. Patch ensure_customer_profile ─────────────────────────────────────────
-- Add an early-return guard: if the caller is an IMS staff account, do nothing.
CREATE OR REPLACE FUNCTION public.ensure_customer_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
BEGIN
  -- IMS staff must never get a customer_profiles row created for them.
  IF EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND raw_app_meta_data->>'user_type' = 'ims_staff'
  ) THEN
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
  'Idempotent: creates a customer_profiles row for the authenticated user if '
  'one does not exist. IMS staff (user_type = ims_staff) are silently skipped. '
  'Updated by migration 068 to block IMS staff from being auto-provisioned.';

-- ── 2. is_ecommerce_customer ──────────────────────────────────────────────────
-- Returns TRUE  iff auth.uid() has a row in ecommerce.customer_profiles AND
--                   is not flagged as ims_staff in app_metadata.
-- Returns FALSE for IMS staff, service accounts, or anyone with no profile.
-- Returns FALSE (not an error) when called as anon/unauthenticated.
--
-- Called by the frontend immediately after every SIGNED_IN event. If it
-- returns false the frontend signs the user out and shows an access-denied
-- message, preventing any IMS credential from being used on the ecommerce app.
CREATE OR REPLACE FUNCTION public.is_ecommerce_customer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
DECLARE
  v_uid        uuid;
  v_is_staff   boolean := false;
  v_has_profile boolean := false;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Check IMS staff flag
  SELECT COALESCE(raw_app_meta_data->>'user_type' = 'ims_staff', false)
  INTO v_is_staff
  FROM auth.users
  WHERE id = v_uid;

  IF v_is_staff THEN
    RETURN false;
  END IF;

  -- Check customer_profiles row exists
  SELECT EXISTS (
    SELECT 1 FROM ecommerce.customer_profiles WHERE id = v_uid
  ) INTO v_has_profile;

  RETURN v_has_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_ecommerce_customer() TO authenticated;
-- anon cannot call this (no session = no uid = always returns false anyway)

COMMENT ON FUNCTION public.is_ecommerce_customer() IS
  'Returns true only when the caller is an authenticated ecommerce customer: '
  'has a customer_profiles row AND is not flagged as ims_staff. '
  'The ecommerce frontend calls this after every SIGNED_IN event and signs '
  'the user out immediately if it returns false, blocking IMS credentials '
  'from being used on the ecommerce app.';

-- ── 3. Cleanup: remove any customer_profiles rows that belong to IMS staff ───
-- Defensive one-time cleanup in case any IMS staff accidentally got a profile
-- created before this migration (e.g. via the old ensure_customer_profile).
DELETE FROM ecommerce.customer_profiles
WHERE id IN (
  SELECT id
  FROM auth.users
  WHERE raw_app_meta_data->>'user_type' = 'ims_staff'
);
