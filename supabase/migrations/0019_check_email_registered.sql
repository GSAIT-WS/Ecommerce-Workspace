-- =============================================================================
-- Migration: 064_check_email_registered.sql
-- Description: Adds a lightweight public RPC that lets the login page check
--   whether an email address belongs to a registered customer account BEFORE
--   surfacing a detailed error message to the user.
--
-- Why: Supabase's signInWithPassword() returns the same generic
--   "Invalid login credentials" error for both wrong-password and
--   unregistered-email cases. We need to distinguish them so the UI can
--   show a helpful "No account found — create one?" message instead of
--   a cryptic error.
--
-- Security note: This function intentionally confirms whether an email is
--   registered. For a public e-commerce store this is standard UX practice
--   (most shops show "no account found" on login). The function is read-only
--   and returns only a boolean — no other user data is exposed.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_email_registered(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.email = lower(trim(p_email))
      AND (
        u.raw_app_meta_data->>'user_type' IS NULL
        OR u.raw_app_meta_data->>'user_type' <> 'ims_staff'
      )
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

-- Allow unauthenticated (anon) callers — needed because the user hasn't
-- signed in yet when they're on the login page.
GRANT EXECUTE ON FUNCTION public.check_email_registered(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_registered(text) TO authenticated;

COMMENT ON FUNCTION public.check_email_registered(text) IS
  'Returns true if a customer account exists for the given email address '
  '(case-insensitive, IMS staff excluded). Called by the login page to '
  'distinguish "wrong password" from "no account" before showing a targeted '
  'error message.';
