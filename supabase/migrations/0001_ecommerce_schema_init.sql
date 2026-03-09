-- =============================================================================
-- Migration: 0001_ecommerce_schema_init.sql
-- Description: Bootstrap the ecommerce schema, enums, and shared utility
--              functions. No dependency on IMS operational schemas.
-- Ownership: Ecommerce team
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Schema
-- ────────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS ecommerce;

-- ────────────────────────────────────────────────────────────────────────────
-- Enums  (all scoped to ecommerce schema for clarity)
-- Idempotent: skip creation if type already exists (e.g. from prior partial run)
-- ────────────────────────────────────────────────────────────────────────────

-- Order lifecycle
DO $$ BEGIN
  CREATE TYPE ecommerce.order_status AS ENUM ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payment attempt result
DO $$ BEGIN
  CREATE TYPE ecommerce.payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Cart / order line item types
DO $$ BEGIN
  CREATE TYPE ecommerce.item_type AS ENUM ('product', 'combo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Discount shape (matches IMS contract v1)
DO $$ BEGIN
  CREATE TYPE ecommerce.discount_type AS ENUM ('none', 'percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Review moderation state
DO $$ BEGIN
  CREATE TYPE ecommerce.review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- Utility: auto-update updated_at on any table
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION ecommerce.handle_updated_at() IS
  'Trigger function: sets updated_at = now() before every UPDATE.';

-- ────────────────────────────────────────────────────────────────────────────
-- Utility: generate human-readable order numbers
-- Format: ECO-YYYYMMDD-XXXXXXXX  (8 random hex chars for uniqueness)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ecommerce.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'ECO-' ||
         to_char(now(), 'YYYYMMDD') || '-' ||
         upper(substring(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$;

COMMENT ON FUNCTION ecommerce.generate_order_number() IS
  'Generates a human-readable, time-prefixed order number. Not guaranteed '
  'strictly sequential — use the orders.id UUID as the authoritative PK.';
