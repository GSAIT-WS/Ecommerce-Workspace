-- =============================================================================
-- Prereq for Migration 006: Ecommerce schema and shared types/functions
-- Run after 001, 002, 004 (public.customers, public.products, public.branches,
-- main_branch.discounts, main_branch.coupons). This file creates only what
-- 006 needs that lives outside 006.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS ecommerce;

-- Order status enum used by online_orders and online_order_status_history
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
    );
  END IF;
END$$;

-- Trigger function to set updated_at on row update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
