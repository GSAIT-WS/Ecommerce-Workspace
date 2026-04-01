# IMS Shipment Status Sync

This document describes the ecommerce integration with IMS for shipment/delivery status.

## Overview

- **Source of truth:** IMS (`ims_ops.live_shipments`)
- **Ecommerce data:** `ecommerce.shipment_status` (synced via IMS triggers)
- **Flow:** Aggregator webhooks → IMS → DB trigger → `ecommerce.shipment_status`
- **Ecommerce role:** Read-only; never write shipment status or handle aggregator webhooks

## Tables

### `ecommerce.shipment_status`

Created by migration `0012_shipment_status.sql`. Column names and types must match the IMS trigger contract exactly.

| Column              | Type        | Notes                                      |
|---------------------|-------------|--------------------------------------------|
| source_shipment_id  | UUID        | PRIMARY KEY, IMS shipment id               |
| order_id            | UUID        | IMS branch order id                        |
| order_date          | TIMESTAMPTZ |                                            |
| status              | TEXT        | preparing, in_transit, delivered, failed    |
| shipment_number     | TEXT        | AWB / tracking number                      |
| estimated_delivery  | TIMESTAMPTZ | Nullable                                   |
| tracking_notes       | TEXT        | Nullable                                   |
| source_updated_at    | TIMESTAMPTZ |                                            |
| synced_at           | TIMESTAMPTZ |                                            |

### Order mapping

`ecommerce.orders` has:

- `ims_order_id` (UUID, nullable) — store when order is sent to IMS
- `shipment_number` (TEXT, nullable) — store when tracking is known (from aggregator/IMS)

Query `shipment_status` by `order_id = orders.ims_order_id` or `shipment_number = orders.shipment_number`.

## Customer-facing labels

| IMS status   | Display label      |
|--------------|--------------------|
| preparing    | Packaging          |
| in_transit   | In transit         |
| delivered    | Delivered          |
| failed       | Delivery issue     |

## Full-sync RPC

If you call `public.ims_full_sync_to_ecommerce()` to resync catalog/discounts/coupons, IMS now also resyncs shipments. The return value includes:

```json
{
  "ok": true,
  "categories_synced": <number>,
  "products_synced": <number>,
  "shipments_synced": <number>
}
```

Handle `shipments_synced` for logging or UI if useful. No breaking change to existing keys.

## Permissions

The IMS DB role (e.g. `postgres` or your IMS trigger role) must have `INSERT`, `UPDATE`, `DELETE`, `SELECT` on `ecommerce.shipment_status`. The migration grants these to `postgres`; adjust if your setup uses a different role.

## Checklist

- [x] Migration: create `ecommerce.shipment_status` with required columns
- [x] Grant `INSERT`, `UPDATE`, `DELETE`, `SELECT` to IMS DB user
- [x] Add `ims_order_id` and `shipment_number` to `ecommerce.orders`
- [x] Read from `shipment_status` and map to orders (get-order-by-id)
- [x] Show customer-facing status (preparing → Packaging, etc.)
- [x] Display tracking info (shipment_number, estimated_delivery, tracking_notes) when available
- [ ] Populate `ims_order_id` / `shipment_number` when orders are sent to IMS (integration-specific)
- [ ] If using `ims_full_sync_to_ecommerce()`, handle `shipments_synced` if useful
