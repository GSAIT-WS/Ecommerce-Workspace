# CrunchX ↔ IMS Integration

This document describes the integration between the **CrunchX** e-commerce backend and the external **IMS (Inventory Management System)**.

---

## Architecture Overview

| System | Responsibility |
|--------|----------------|
| **CrunchX** | Users, cart, addresses, orders, payments, checkout |
| **IMS** | SKU stock levels, inventory reservation, inventory release on cancellations |

CrunchX communicates with IMS via **HTTP API calls**. There are no direct database connections between the two systems.

---

## Integration Flow

### 1. Add to Cart

**No IMS interaction.** The cart stores only `product_id` and `quantity`. Stock is not reserved at this stage.

### 2. Checkout / Place Order

When the `place-order` Edge Function is called:

1. **Validate cart** — Call `get_cart_ims_items` RPC to validate cart and obtain IMS payload
2. **Reserve in IMS** — Send HTTP POST to IMS reservation API:

   ```json
   {
     "order_id": "uuid",
     "items": [
       { "sku": "ALMOND_CRUNCH_200G", "quantity": 2 },
       { "sku": "PROTEIN_BAR_50G", "quantity": 1 }
     ]
   }
   ```

3. **If IMS succeeds** — Create order in CrunchX DB via `place_order` RPC, status `pending_payment`
4. **If IMS fails** — Reject order, return error: *"Inventory reservation failed. Please try again."*

### 3. Payment Success

When the payment webhook receives a success event:

- Update order status to `confirmed`
- **IMS reservation remains locked** (no new IMS call)

### 4. Payment Failure

When the payment webhook receives a failure event:

- Update order status to `cancelled`
- Call IMS release API to free reserved inventory

### 5. Order Cancellation

When a user cancels an order (or admin cancels):

- Update order status to `cancelled` in CrunchX
- Call IMS release API:

  ```json
  {
    "order_id": "uuid",
    "items": [
      { "sku": "ALMOND_CRUNCH_200G", "quantity": 2 }
    ]
  }
  ```

---

## Database Schema (CrunchX)

### `ecommerce.orders`

Stores order metadata. No direct IMS columns; `order_id` is used as the cross-system identifier.

### `ecommerce.order_items`

Each row includes:

| Column | Purpose |
|--------|---------|
| `sku` | IMS SKU identifier (same as `product_external_id` for products) |
| `quantity` | Quantity ordered |
| `unit_price` | Price at order time |

These fields are used to construct IMS reservation and release requests.

---

## Edge Functions Involved

| Function | IMS Interaction |
|----------|-----------------|
| **place-order** | 1. Call `get_cart_ims_items` for payload<br>2. Call IMS **reserve** API<br>3. If success → call `place_order` RPC |
| **cancel-order** | After `cancel_order` RPC succeeds → call IMS **release** API |
| **payment-webhook** | On payment failure → call IMS **release** API |
| **create-online-order** | *Uses different RPC (`create_online_order`). IMS integration can be added similarly if this flow is used.* |

---

## IMS API Contract

### Reserve Endpoint

```
POST {IMS_BASE_URL}/reserve
Content-Type: application/json
Authorization: Bearer {IMS_API_KEY}   # optional

{
  "order_id": "uuid",
  "items": [
    { "sku": "string", "quantity": number }
  ]
}

Success: 2xx, body may include { "success": true }
Failure: 4xx/5xx or { "success": false, "error": "message" }
```

### Release Endpoint

```
POST {IMS_BASE_URL}/release
Content-Type: application/json
Authorization: Bearer {IMS_API_KEY}   # optional

{
  "order_id": "uuid",
  "items": [
    { "sku": "string", "quantity": number }
  ]
}

Success: 2xx, body may include { "success": true }
Failure: 4xx/5xx or { "success": false, "error": "message" }
```

---

## Configuration

Set these environment variables for Edge Functions:

| Variable | Required | Description |
|----------|-----------|-------------|
| `IMS_BASE_URL` | Yes (prod) | Base URL of IMS API, e.g. `https://ims.example.com/api` |
| `IMS_API_KEY` | No | Optional API key; sent as `Authorization: Bearer` and `X-API-Key` |

**Development:** If `IMS_BASE_URL` is not set, IMS calls are skipped (reserve/release return success). Useful for local development without an IMS instance.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| IMS reserve fails on place-order | Do not create order. Return 503: *"Inventory reservation failed. Please try again."* |
| IMS release fails on cancel | Order is already cancelled in DB. Log error; do not fail the cancel response. Manual IMS reconciliation may be needed. |
| IMS release fails on payment webhook | Same as cancel — log, don't fail. |
| IMS unavailable (network/timeout) | Treated as failure. User sees generic retry message. |

All IMS responses are logged for debugging.

---

## RPCs

### `ecommerce.get_cart_ims_items`

Returns IMS reservation payload without creating an order. Validates customer, address, cart, stock, and coupon.

**Parameters:** `p_customer_id`, `p_shipping_address_id`, `p_coupon_code` (optional)

**Returns:** `{ ok: true, ims_reserve_items: [{ sku, quantity }, ...] }` or `{ ok: false, error: "..." }`

### `ecommerce.place_order`

Creates order from cart. Accepts optional `p_order_id` — when provided (after IMS reserve), uses it for the order ID.

**Parameters:** `p_customer_id`, `p_shipping_address_id`, `p_coupon_code`, `p_notes`, `p_order_id` (optional)

### `ecommerce.cancel_order`

Cancels order and returns `ims_release_items` for the Edge Function to pass to IMS.

### `ecommerce.process_payment_webhook`

On payment failure, cancels order and returns `ims_release_items` for IMS release.

---

## Sequence Diagram

```
User          place-order EF    get_cart_ims_items    IMS Reserve    place_order RPC
  |                  |                    |                |                |
  |-- Place Order -->|                    |                |                |
  |                  |-- get items ------->|                |                |
  |                  |<-- ims_items ------|                |                |
  |                  |-- reserve -------------------------->|                |
  |                  |<-- success --------------------------|                |
  |                  |-- create order -------------------------------------->|
  |                  |<-- order_id -----------------------------------------|
  |<-- Order created |                    |                |                |
```

```
User          cancel-order EF    cancel_order RPC     IMS Release
  |                  |                    |                |
  |-- Cancel ------->|                    |                |
  |                  |-- cancel ---------->|                |
  |                  |<-- ims_release_items|                |
  |                  |-- release -------------------------->|
  |<-- Cancelled     |                    |                |
```
