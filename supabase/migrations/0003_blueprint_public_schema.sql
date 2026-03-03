-- =============================================================================
-- CrunchX Blueprint: public schema (users, products, categories, orders,
-- order_items, cart_items, reviews, bulk_requests, gift_options, combos, combo_items)
-- Aligned with CrunchX Architecture Blueprint. Stock in products.stock_quantity.
-- =============================================================================

-- Ensure order_status enum exists (blueprint: pending, confirmed, processing, shipped, delivered, cancelled)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    );
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'processing'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'processing';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Enums per blueprint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
    CREATE TYPE public.discount_type AS ENUM ('none', 'bulk', 'combo');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bulk_request_status') THEN
    CREATE TYPE public.bulk_request_status AS ENUM ('pending', 'quoted', 'approved', 'rejected');
  END IF;
END$$;

-- users (blueprint: replaces "customers" for unified user model)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  phone varchar(20),
  role public.user_role NOT NULL DEFAULT 'customer',
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  description text,
  image_url varchar(500),
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  stock_quantity int NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category_id uuid REFERENCES public.categories(id),
  image_url varchar(500),
  is_active boolean DEFAULT true,
  nutrition_info jsonb,
  weight_grams decimal(8,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- combos before order_items (order_items.combo_id references combos)
CREATE TABLE IF NOT EXISTS public.combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  name varchar(200),
  total_price decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  tier int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  discount_type public.discount_type,
  shipping_address jsonb NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_ref varchar(255),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  combo_id uuid REFERENCES public.combos(id),
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  discount_applied decimal(10,2) DEFAULT 0,
  line_total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Cart: user-scoped (no cart table in blueprint)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL CHECK (quantity > 0),
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.bulk_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL CHECK (quantity >= 25),
  status public.bulk_request_status NOT NULL DEFAULT 'pending',
  quoted_price decimal(10,2),
  notes text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gift_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_name varchar(200) NOT NULL,
  recipient_email varchar(255),
  message text,
  delivery_date date,
  is_surprise boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.combo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id uuid NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL CHECK (quantity > 0)
);

-- Triggers for updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER bulk_requests_updated_at
  BEFORE UPDATE ON public.bulk_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
