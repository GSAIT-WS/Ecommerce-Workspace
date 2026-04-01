# CrunchX Backend — Blueprint Alignment

This document aligns the **CrunchX Architecture Blueprint** (Lovable, March 2026) with the current implementation and notes corrections or adaptations.

## Implementation Stack vs Blueprint

| Aspect | Blueprint | This Repo |
|--------|-----------|-----------|
| Runtime | Node.js + Express | **Supabase (Deno Edge Functions)** |
| ORM / DB access | Prisma | **Supabase client + PostgreSQL RPC** |
| Auth | JWT (express middleware) | **Supabase Auth + JWT** (Edge Functions use service role or anon + RLS) |
| API shape | REST `/api/auth`, `/api/orders`, etc. | **Edge Functions** e.g. `create-online-order`, `place-order` — same contracts where applicable |

**Decision:** Keep Supabase/Edge Functions. Match **data model** and **API contracts** (request/response shapes) to the blueprint so the frontend and IMS can integrate without change.

---

## Schema Alignment

### Blueprint uses `public` schema

- **users** — id, email, password_hash, first_name, last_name, phone, role, address, created_at, updated_at  
- **products** — id, name, description, price, **stock_quantity**, category_id, image_url, is_active, nutrition_info, weight_grams  
- **categories** — id, name, slug, description, image_url, is_active, sort_order  
- **orders** — id, **user_id**, status, subtotal, discount_amount, total, discount_type, shipping_address, payment_status, payment_ref  
- **order_items** — id, order_id, product_id, combo_id (nullable), quantity, unit_price, discount_applied, line_total  
- **cart_items** — id, **user_id**, product_id, quantity, added_at (no cart table; cart = all cart_items for a user)  
- **reviews**, **bulk_requests**, **gift_options**, **combos**, **combo_items** — as per blueprint  

### Corrections / clarifications to the plan

1. **Stock**  
   Blueprint: *"Stock reserved at order creation"* and *"Atomic stock decrement"* using **products.stock_quantity**.  
   No separate IMS inventory table in the blueprint; IMS and e‑commerce both update **products.stock_quantity**.  
   **Concurrency:** Use `SELECT ... FOR UPDATE` (or atomic `UPDATE ... WHERE stock_quantity >= qty RETURNING ...`) in the same transaction as order creation to avoid race conditions.

2. **Order status**  
   Blueprint: `pending → confirmed → processing → shipped → delivered` (and `cancelled`).  
   Existing enum had `packed`; we treat **processing** as the canonical value and use it in migrations (add to enum if missing).

3. **Cart model**  
   Blueprint has **cart_items** keyed by **user_id** only (no `cart` table, no `cart_id`).  
   Place-order flow: load cart by **user_id**, get product prices from **products** at order time, then create **orders** + **order_items**, decrement **products.stock_quantity**, clear **cart_items** for that user.

4. **Discount at order**  
   Blueprint: **orders.discount_type** = `none` | `bulk` | `combo`; **orders.discount_amount** = applied value.  
   No coupon table in blueprint; coupon/promo can be added later as an extension (e.g. optional **coupons** table and discount_type `coupon`).

5. **Payment**  
   Blueprint: order created with **payment_status** = `pending`; payment gateway returns client_secret; webhook sets **payment_status** = `paid` / `failed` and restores stock on failure.  
   Edge Functions create the order and return it; payment flow (intent + webhook) is implemented separately.

---

## API Contracts (aligned with blueprint)

- **POST /api/orders** (place order)  
  Request: `{ shipping_address, payment_method?, gift_option? }`  
  Response: `{ order: { id, total, status, payment_intent }, message }`  
  Implemented via Edge Function **place-order** (user from JWT or body for testing).

- **Cart**  
  GET/POST/PUT/DELETE cart items by **user**; no cart_id in API.  
  Implemented via Edge Functions that use **cart_items** filtered by **user_id**.

- **Products, categories, reviews, bulk-requests, combos, profile, admin**  
  Same shapes as blueprint; implement as Edge Functions or RPCs as needed.

---

## File / Naming Conventions

- **Migrations:** `supabase/migrations/` — create and alter **public** tables and enums to match blueprint; add RPCs (e.g. `place_order`) that run in a single transaction.
- **Edge Functions:** `supabase/functions/<name>/index.ts` — validate input, call RPC or Supabase client, return JSON.
- **Shared logic:** `supabase/functions/_shared/services/` — validation and pure business logic; no Supabase in services, only in Edge Functions.

---

## Two order flows (both supported)

| Flow | Tables / RPC | Edge Function | When to use |
|------|----------------|---------------|-------------|
| **Blueprint** | `public.users`, `public.cart_items`, `public.orders`, `public.order_items`, `public.products.stock_quantity`; RPC `public.place_order` | `place-order` | Default: user-scoped cart, JWT or `user_id` in body. |
| **E-commerce (legacy)** | `ecommerce.cart`, `ecommerce.cart_items`, `ecommerce.online_orders`, `ecommerce.online_order_items`; RPC `ecommerce.create_online_order` | `create-online-order` | When you use cart-by-`cart_id` and optional coupons/IMS inventory. |

Use **place-order** and the public schema for blueprint-aligned behavior. Use **create-online-order** when the app uses the ecommerce schema and cart IDs.

---

## Summary

- **Backend plan** is followed for data model, stock handling, order lifecycle, and API contracts.  
- **Edits to the plan:** (1) Stock in **products.stock_quantity** with atomic updates; (2) Cart is **user_id**-scoped **cart_items**; (3) Order status uses **processing** (not only **packed**); (4) Implementation uses Supabase Edge Functions and RPCs instead of Express/Prisma.
