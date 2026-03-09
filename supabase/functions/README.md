# CrunchX E-Commerce — Edge Functions & Service Layer

## 1. System Vision

This backend follows the **IMS Backend Ultimate Architecture Plan**: a rule-driven, ERP-grade transactional system built on **Supabase Edge Functions**, a strict **Service Layer**, and modular separation of concerns. Edge functions act as thin API controllers — all business logic lives in the shared service layer.

### Architecture Flow

```
Frontend (Web / Dashboard UI)
        ↓
Edge Functions  (API Controllers — auth, parse, respond)
        ↓
Service Layer   (Business Logic — validation, transformation)
        ↓
Supabase Client / RPC  (Database Access Layer)
        ↓
Supabase PostgreSQL Database
```

---

## 2. Folder Structure

```
supabase/functions/
├── _shared/                        # Shared code imported by every edge function
│   ├── cors.ts                     # CORS headers & withCors() helper
│   ├── response.ts                 # jsonResponse, successResponse, errorResponse
│   ├── supabaseClient.ts          # createSupabaseClient, createSupabaseServiceRoleClient
│   ├── validation.ts              # UUID_REGEX, isValidUuid()
│   └── services/                  # ⭐ Business logic engine
│       ├── index.ts               # Barrel re-export of all services & types
│       ├── types.ts               # Shared TypeScript interfaces & type aliases
│       ├── cartService.ts         # Cart math (totals, validation — no DB)
│       ├── cartCrudService.ts     # Cart CRUD param validators
│       ├── productService.ts      # Product listing & detail validators
│       ├── categoryService.ts     # Category listing validators
│       ├── orderService.ts        # Order math (totals — no DB)
│       ├── onlineOrderService.ts  # Online order creation validators
│       ├── placeOrderService.ts   # Place-order request validators
│       ├── ordersReadService.ts   # Order read & cancel validators
│       ├── paymentIntentService.ts# Payment intent param validators
│       ├── paymentWebhookService.ts # Webhook payload validators
│       └── imsService.ts            # IMS HTTP client (reserve/release)
│
├── add-to-cart/                   # POST  — Add item to cart
├── update-cart-item/              # POST | PUT | PATCH — Update cart quantity
├── remove-cart-item/              # POST | DELETE — Remove cart item
├── clear-cart/                    # POST | DELETE — Clear entire cart
├── get-cart/                      # POST | GET — Retrieve cart
├── cart-totals/                   # POST — Compute cart totals (stateless)
│
├── list-products/                 # POST | GET — Browse products (filter/search/paginate)
├── get-product-by-id/             # POST | GET — Single product detail
├── list-categories/               # GET | POST — All active categories
│
├── create-online-order/           # POST — Create order from cart (RPC)
├── place-order/                   # POST — Place order from cart (JWT auth)
├── process-order/                 # POST — Validate & compute order totals (stateless)
├── list-my-orders/                # POST | GET — User's paginated orders
├── get-order-by-id/               # POST | GET — Full order detail
├── cancel-order/                  # POST — Cancel a pending/confirmed order
│
├── create-payment-intent/         # POST — Create payment attempt for order
├── payment-webhook/               # POST — Handle payment gateway callbacks
└── README.md
```

---

## 2.5 IMS Integration

CrunchX coordinates inventory with an external **IMS (Inventory Management System)** via HTTP:

- **place-order** — Calls IMS reserve API *before* creating the order. If IMS fails, no order is created.
- **cancel-order** — Calls IMS release API after cancelling.
- **payment-webhook** — On payment failure, calls IMS release API.

See [docs/IMS_INTEGRATION.md](../../docs/IMS_INTEGRATION.md) for full details.

---

## 3. Edge Function Reference

### 3.1 Product Catalog

| Function | Method(s) | Auth | Description |
|---|---|---|---|
| `list-products` | GET, POST | No | Paginated product listing with optional filters |
| `get-product-by-id` | GET, POST | No | Retrieve single product details |
| `list-categories` | GET, POST | No | All active categories sorted by display order |

#### `list-products`

```
POST /list-products
GET  /list-products?category_id=uuid&search=term&min_price=0&max_price=100&limit=20&offset=0
```

**Request body (POST):**
```json
{
  "category_id": "uuid (optional)",
  "search": "string (optional)",
  "min_price": 0,
  "max_price": 100,
  "limit": 20,
  "offset": 0
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [{ "id": "uuid", "name": "...", "price": 29.99, "stock_quantity": 50, "..." }],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

#### `get-product-by-id`

```
POST /get-product-by-id        { "product_id": "uuid" }
GET  /get-product-by-id?product_id=uuid
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "...", "description": "...", "price": 29.99, "stock_quantity": 50 }
}
```

#### `list-categories`

```
GET /list-categories
```

**Response (200):**
```json
{
  "success": true,
  "data": { "items": [{ "id": "uuid", "name": "Snacks", "sort_order": 1 }] }
}
```

---

### 3.2 Cart Management

| Function | Method(s) | Auth | Description |
|---|---|---|---|
| `add-to-cart` | POST | No | Add product or combo to cart |
| `update-cart-item` | POST, PUT, PATCH | No | Update item quantity (0 removes) |
| `remove-cart-item` | POST, DELETE | No | Remove a specific cart item |
| `clear-cart` | POST, DELETE | No | Delete all items in user's cart |
| `get-cart` | GET, POST | No | Retrieve cart with product details |
| `cart-totals` | POST | No | Compute totals from item array (stateless) |

#### `add-to-cart`

```
POST /add-to-cart
```

**Request body:**
```json
{
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 2,
  "item_type": "product"
}
```

Combo variant:
```json
{
  "user_id": "uuid",
  "quantity": 1,
  "item_type": "combo",
  "customization": {
    "items": [
      { "product_id": "uuid", "quantity": 1 },
      { "product_id": "uuid", "quantity": 2 }
    ],
    "gift_wrap": true,
    "gift_message": "Happy Birthday!"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "user_id": "uuid", "product_id": "uuid", "item_type": "product", "quantity": 2, "unit_price": 14.99 }
}
```

#### `update-cart-item`

```
POST /update-cart-item
```

**Request body:**
```json
{ "user_id": "uuid", "product_id": "uuid", "quantity": 3 }
```

Set `quantity: 0` to remove the item. Can also use `cart_item_id` instead of `product_id`.

#### `remove-cart-item`

```
POST   /remove-cart-item         { "user_id": "uuid", "product_id": "uuid" }
DELETE /remove-cart-item?user_id=uuid&product_id=uuid
```

Can use `cart_item_id` instead of `product_id`.

#### `clear-cart`

```
POST   /clear-cart               { "user_id": "uuid" }
DELETE /clear-cart?user_id=uuid
```

#### `get-cart`

```
POST /get-cart                   { "user_id": "uuid" }
GET  /get-cart?user_id=uuid
```

**Response (200):**
```json
{
  "success": true,
  "data": { "user_id": "uuid", "items": [{ "id": "uuid", "product_id": "uuid", "quantity": 2, "unit_price": 14.99 }] }
}
```

#### `cart-totals` (stateless)

```
POST /cart-totals
```

**Request body:**
```json
{
  "items": [
    { "quantity": 2, "unit_price": 14.99 },
    { "quantity": 1, "unit_price": 9.99 }
  ]
}
```

**Response (200):**
```json
{ "ok": true, "totals": { "subtotal": 39.97, "itemCount": 3 } }
```

---

### 3.3 Orders

| Function | Method(s) | Auth | Description |
|---|---|---|---|
| `create-online-order` | POST | No | Create order from cart via RPC |
| `place-order` | POST | JWT / user_id | Place order (validates stock, deducts inventory) |
| `process-order` | POST | No | Compute order totals (stateless) |
| `list-my-orders` | GET, POST | No | Paginated order list for a user |
| `get-order-by-id` | GET, POST | No | Full order detail with items & history |
| `cancel-order` | POST | No | Cancel a pending/confirmed order |

#### `create-online-order`

```
POST /create-online-order
```

**Request body:**
```json
{
  "customer_id": "uuid",
  "cart_id": "uuid",
  "coupon_code": "SAVE10 (optional)",
  "shipping_amount": 5.00,
  "shipping_address": "123 Main St"
}
```

**Response (201):**
```json
{
  "success": true,
  "order_id": "uuid",
  "subtotal": 59.97,
  "discount_amount": 5.99,
  "shipping_amount": 5.00,
  "total": 58.98
}
```

#### `place-order`

```
POST /place-order
Authorization: Bearer <JWT>
```

**Request body:**
```json
{
  "shipping_address": "123 Main St",
  "payment_method": "card",
  "gift_option": false,
  "discount_type": "percentage",
  "discount_amount": 10,
  "shipping_amount": 5.00
}
```

**Response (201):**
```json
{
  "order": {
    "id": "uuid",
    "total": 58.98,
    "status": "pending",
    "subtotal": 59.97,
    "discount_amount": 5.99,
    "shipping_amount": 5.00,
    "payment_intent": "pi_uuid"
  },
  "message": "Order placed successfully"
}
```

**Error — insufficient stock (409):**
```json
{
  "success": false,
  "error": "INSUFFICIENT_STOCK",
  "message": "Not enough stock",
  "product_id": "uuid",
  "requested": 5,
  "available": 2
}
```

#### `process-order` (stateless)

```
POST /process-order
```

**Request body:**
```json
{
  "items": [{ "product_id": "uuid", "quantity": 2, "unit_price": 14.99, "name": "Trail Mix" }],
  "delivery_charge": 5.00,
  "discount_amount": 2.00
}
```

**Response (200):**
```json
{ "ok": true, "totals": { "subtotal": 29.98, "deliveryCharge": 5.00, "discount": 2.00, "total": 32.98 } }
```

#### `list-my-orders`

```
POST /list-my-orders             { "user_id": "uuid", "limit": 10, "offset": 0 }
GET  /list-my-orders?user_id=uuid&limit=10&offset=0
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [{ "id": "uuid", "created_at": "...", "order_status": "pending", "payment_status": "pending", "total_amount": 58.98 }],
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

#### `get-order-by-id`

```
POST /get-order-by-id            { "user_id": "uuid", "order_id": "uuid" }
GET  /get-order-by-id?user_id=uuid&order_id=uuid
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_status": "confirmed",
    "payment_status": "paid",
    "total_amount": 58.98,
    "items": [{ "id": "uuid", "product_id": "uuid", "product_name": "Trail Mix", "quantity": 2, "unit_price": 14.99, "line_total": 29.98 }],
    "status_history": [{ "id": "uuid", "status": "pending", "created_at": "..." }]
  }
}
```

#### `cancel-order`

```
POST /cancel-order
```

**Request body:**
```json
{ "user_id": "uuid", "order_id": "uuid" }
```

Only orders with status `pending` or `confirmed` can be cancelled. Stock is automatically restored.

---

### 3.4 Payments

| Function | Method(s) | Auth | Description |
|---|---|---|---|
| `create-payment-intent` | POST | No | Create payment attempt for an order |
| `payment-webhook` | POST | No | Handle payment gateway callbacks |

#### `create-payment-intent`

```
POST /create-payment-intent
```

**Request body:**
```json
{ "user_id": "uuid", "order_id": "uuid" }
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "payment_intent_id": "uuid",
    "client_secret": "pi_secret_...",
    "amount_cents": 5898,
    "currency": "INR",
    "order_id": "uuid"
  }
}
```

#### `payment-webhook`

```
POST /payment-webhook
```

**Request body:**
```json
{ "external_id": "pi_uuid", "outcome": "succeeded" }
```

| Outcome | Effect |
|---|---|
| `succeeded` | `payment_status → paid`, `order_status → confirmed` |
| `failed` | `payment_status → failed`, stock restored |

**Response (200):**
```json
{
  "success": true,
  "order_id": "uuid",
  "payment_status": "paid",
  "order_status": "confirmed"
}
```

---

## 4. Order Statuses

```
pending → confirmed → packed → shipped → delivered
    ↓         ↓
 cancelled  cancelled
```

Only `pending` and `confirmed` orders can be cancelled.

---

## 5. Service Layer Types

| Type | Fields |
|---|---|
| `OrderItemInput` | `product_id, quantity, unit_price, name?` |
| `OrderTotals` | `subtotal, deliveryCharge, discount, total` |
| `CartItemInput` | `product_id?, quantity, unit_price, item_type?, combo_id?, customization_json?` |
| `ComboCustomization` | `items: { product_id, quantity }[], gift_wrap?, gift_message?` |
| `CartTotals` | `subtotal, itemCount` |
| `OrderSummary` | `id, created_at, order_status, payment_status, total_amount, subtotal?, discount_amount?, shipping_amount?` |
| `OrderItemDetail` | `id, product_id, product_name, quantity, unit_price, line_total` |
| `OrderStatusHistoryEntry` | `id, status, created_at` |
| `CreatePaymentIntentResult` | `payment_intent_id, client_secret?, amount_cents, currency, order_id` |

---

## 6. Shared Utilities

| Module | Exports | Purpose |
|---|---|---|
| `cors.ts` | `corsHeaders`, `withCors()` | CORS header management |
| `response.ts` | `jsonResponse()`, `successResponse()`, `errorResponse()` | Standardised HTTP responses |
| `supabaseClient.ts` | `createSupabaseClient(req)`, `createSupabaseServiceRoleClient()` | Supabase client factories |
| `validation.ts` | `UUID_REGEX`, `isValidUuid()` | UUID format validation |

---

## 7. Error Response Format

All edge functions return errors in a consistent shape:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

Common HTTP status codes: `400` (bad request), `401` (unauthorized), `403` (forbidden), `404` (not found), `409` (conflict / stock), `500` (internal).

---

## 8. Engineering Rules

1. **No business logic inside edge functions.** Edge functions only parse requests, check auth, call the service layer, and return responses.
2. **Service layer is pure logic.** No HTTP handling, no Supabase client instantiation inside services.
3. **All params validated** through dedicated service validators before any DB call.
4. **Consistent response shape** via `successResponse()` / `errorResponse()` helpers.
5. **CORS handled** on every function using `corsHeaders` and the `OPTIONS` preflight check.

---

## 9. Development

### Run locally

```bash
npx supabase functions serve
```

### Deploy a single function

```bash
npx supabase functions deploy <function-name>
```

### Deploy all functions

```bash
npx supabase functions deploy
```

### Adding a new edge function

1. Create `supabase/functions/<name>/index.ts`.
2. Import from `../_shared/cors.ts`, `../_shared/response.ts`, and `../_shared/services/index.ts`.
3. Handle `OPTIONS` preflight → parse request → validate via service → call DB → return response.
4. Put all business logic and types in `_shared/services/`.

---

## 10. Base URL

All functions are available at:

```
https://hxedadvtqsypatkvqhoh.supabase.co/functions/v1/<function-name>
```

Include the `Authorization: Bearer <anon-key>` header (or a user JWT) for authenticated requests.
