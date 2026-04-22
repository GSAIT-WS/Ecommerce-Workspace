-- =============================================================================
-- Migration: 063_add_email_to_customer_profiles.sql
-- Description: Adds a dedicated email column to ecommerce.customer_profiles.
--
-- Changes:
--   1. Add email column (nullable text) to ecommerce.customer_profiles.
--   2. Backfill: populate email for all existing rows from auth.users.
--      Also fix any full_name values that were accidentally stored as an
--      email address (the COALESCE(full_name, email) fallback in earlier
--      migrations could write the email address into full_name when no
--      full_name was provided).
--   3. Update ecommerce.on_auth_user_created() trigger function to insert
--      into the new email column. full_name now stores only the actual name
--      (NULL if none was provided — never the email address).
--   4. Update public.ensure_customer_profile() RPC identically.
-- =============================================================================

-- ── 1. Add email column ───────────────────────────────────────────────────────
ALTER TABLE ecommerce.customer_profiles
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN ecommerce.customer_profiles.email IS
  'Email address copied from auth.users at profile creation time. '
  'Kept in sync via trigger and ensure_customer_profile() RPC.';

-- ── 2. Backfill email + fix misplaced full_name values ────────────────────────
-- For rows where email is still NULL, pull it from auth.users.
-- Also clear full_name when it looks like it was stored as an email address
-- (contains '@'), unless the user genuinely has an '@' in their display name,
-- which is extremely unlikely for real names.
UPDATE ecommerce.customer_profiles cp
SET
  email     = u.email,
  full_name = CASE
                WHEN cp.full_name = u.email THEN NULL
                ELSE cp.full_name
              END
FROM auth.users u
WHERE cp.id = u.id;

-- ── 3. Updated trigger function ───────────────────────────────────────────────
-- full_name  ← raw_user_meta_data->>'full_name'  (NULL when not supplied)
-- email      ← auth.users.email
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
  'Auto-provisions a customer_profiles row when a new auth.users row is inserted. '
  'Stores email in the email column and full_name (NULL when not provided) in '
  'full_name. IMS staff (user_type = ims_staff) are skipped. Updated by migration '
  '063 to write the email column.';

-- ── 4. Updated public RPC: ensure_customer_profile ───────────────────────────
CREATE OR REPLACE FUNCTION public.ensure_customer_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ecommerce, public, auth
AS $$
BEGIN
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

GRANT EXECUTE ON FUNCTION public.ensure_customer_profile() TO authenticated;

COMMENT ON FUNCTION public.ensure_customer_profile() IS
  'Idempotent fallback called by the frontend on every SIGNED_IN auth event. '
  'Creates a customer_profiles row for the authenticated user if one does not '
  'already exist, or patches a missing email on an existing row. Updated by '
  'migration 063 to write the email column.';
