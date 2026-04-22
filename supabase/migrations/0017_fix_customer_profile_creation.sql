-- =============================================================================
-- Migration: 062_fix_customer_profile_creation.sql
-- Description: Fixes the customer profile auto-creation flow.
--
-- Problem: The trigger trg_on_auth_user_created on auth.users was dropped by
--   one of the intermediate remote-only migrations (009, 017-060) that were
--   applied directly on the remote DB and had no matching local files. New
--   signups therefore land in auth.users but not in
--   ecommerce.customer_profiles.
--
-- Changes:
--   1. Backfill: insert missing customer_profiles rows for any auth.users
--      records (non-IMS-staff) that don't already have a profile.
--   2. Recreate ecommerce.on_auth_user_created() and its trigger on
--      auth.users, restoring the authoritative server-side path.
--   3. Create public.ensure_customer_profile() — a SECURITY DEFINER RPC
--      callable by any authenticated user. Acts as an idempotent fallback
--      so the frontend can guarantee a profile exists after every sign-in
--      regardless of trigger state.
-- =============================================================================

-- ── 1. Backfill missing profiles ──────────────────────────────────────────────
-- Covers all existing auth.users rows that never got a customer_profiles row
-- because the trigger was down. Safe to re-run: ON CONFLICT (id) DO NOTHING.
INSERT INTO ecommerce.customer_profiles (id, full_name)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
LEFT JOIN ecommerce.customer_profiles cp ON cp.id = u.id
WHERE cp.id IS NULL
  AND (
    u.raw_app_meta_data->>'user_type' IS NULL
    OR u.raw_app_meta_data->>'user_type' <> 'ims_staff'
  )
ON CONFLICT (id) DO NOTHING;

-- ── 2. Recreate trigger function ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.on_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce
AS $$
BEGIN
  -- IMS staff belong in public.profiles only, not ecommerce.customer_profiles.
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
  'except for IMS staff (user_type = ims_staff). Recreated by migration 062 after '
  'the trigger was lost during intermediate remote-only migrations (009, 017-060).';

-- ── 3. Recreate trigger on auth.users ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ecommerce.on_auth_user_created();

-- ── 4. Public RPC: ensure_customer_profile ────────────────────────────────────
-- Called by the frontend on every SIGNED_IN event as an idempotent fallback.
-- SECURITY DEFINER lets it write past RLS (no INSERT policy on authenticated
-- role by design). Only ever inserts for auth.uid() — cannot be misused to
-- create profiles for other users.
CREATE OR REPLACE FUNCTION public.ensure_customer_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
BEGIN
  INSERT INTO ecommerce.customer_profiles (id, full_name)
  SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email)
  FROM auth.users u
  WHERE u.id = auth.uid()
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Allow any signed-in user to invoke this function.
GRANT EXECUTE ON FUNCTION public.ensure_customer_profile() TO authenticated;

COMMENT ON FUNCTION public.ensure_customer_profile() IS
  'Idempotent fallback called by the frontend on every SIGNED_IN auth event. '
  'Creates a customer_profiles row for the authenticated user if one does not '
  'already exist. Safe to call repeatedly; ON CONFLICT (id) DO NOTHING.';
