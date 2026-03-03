# Edge Functions & Service Layer

## Structure

- **`_shared/`** – Shared code used by Edge Functions.
  - **`services/`** – Business logic (no HTTP, no Supabase). Import this from Edge Functions.
  - **`cors.ts`** – CORS headers.
  - **`supabaseClient.ts`** – Supabase client helpers for Edge Functions that need DB access.

- **Edge Functions** – `process-order`, `cart-totals`, `place-order`, `create-online-order`, **Phase 1:** `list-products`, `get-product-by-id`, `list-categories`, **Phase 2 (cart):** `get-cart`, `add-to-cart`, `update-cart-item`, `remove-cart-item`, `clear-cart`.

## Flow

1. Edge Function receives the request (HTTP, CORS, auth).
2. Edge Function imports from `_shared/services/` and calls service functions with parsed input.
3. Service layer returns results; Edge Function sends the HTTP response.

## Adding a new Edge Function

1. Create `supabase/functions/<name>/index.ts`.
2. Import from `../_shared/cors.ts` and `../_shared/services/index.ts`.
3. Put business logic in `_shared/services/` (e.g. `orderService.ts`, `cartService.ts`), not in the function.

## Run locally

```bash
npx supabase functions serve
```

Deploy with `supabase functions deploy <name>`.
