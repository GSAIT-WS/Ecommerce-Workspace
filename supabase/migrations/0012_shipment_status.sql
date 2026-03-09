-- =============================================================================
-- Migration: 0012_shipment_status.sql
-- Description: IMS → Ecommerce shipment status sync (read-only for ecommerce).
--              IMS syncs from ims_ops.live_shipments via triggers; ecommerce
--              only reads. Column names/types must match IMS trigger contract.
--
-- Contract: IMS upserts and deletes rows; IMS does NOT create the table.
-- Mapping: Use order_id (IMS branch order id) or shipment_number to link
--          to ecommerce.orders (store ims_order_id or shipment_number when
--          order is sent to IMS/aggregator).
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- Order mapping columns: link ecommerce.orders to IMS shipment_status
-- Populate when order is sent to IMS (ims_order_id) or when tracking is known
-- (shipment_number from aggregator/IMS)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.orders
  ADD COLUMN IF NOT EXISTS ims_order_id    uuid,
  ADD COLUMN IF NOT EXISTS shipment_number text;

CREATE INDEX IF NOT EXISTS idx_orders_ims_order_id ON ecommerce.orders (ims_order_id) WHERE ims_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_shipment_number ON ecommerce.orders (shipment_number) WHERE shipment_number IS NOT NULL;

COMMENT ON COLUMN ecommerce.orders.ims_order_id IS
  'IMS branch order id. Store when order is sent to IMS; used to map ecommerce.shipment_status.order_id.';
COMMENT ON COLUMN ecommerce.orders.shipment_number IS
  'Tracking/AWB number. Store when received from aggregator/IMS; used to map ecommerce.shipment_status.shipment_number.';

-- ────────────────────────────────────────────────────────────────────────────
-- Shipment status (synced from ims_ops.live_shipments via IMS triggers)
-- Required columns — names and types must match IMS trigger contract exactly
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE ecommerce.shipment_status (
  source_shipment_id  uuid        PRIMARY KEY,  -- IMS shipment id
  order_id            uuid        NOT NULL,     -- IMS branch order id (link to ecommerce.orders.ims_order_id)
  order_date          timestamptz NOT NULL,
  status              text        NOT NULL,     -- preparing | in_transit | delivered | failed
  shipment_number     text,
  estimated_delivery  timestamptz,
  tracking_notes      text,
  source_updated_at   timestamptz,
  synced_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_status_order_id ON ecommerce.shipment_status (order_id);
CREATE INDEX idx_shipment_status_shipment_number ON ecommerce.shipment_status (shipment_number);
CREATE INDEX idx_shipment_status_status ON ecommerce.shipment_status (status);

COMMENT ON TABLE ecommerce.shipment_status IS
  'Shipment/delivery status synced from ims_ops.live_shipments via IMS triggers. '
  'Ecommerce reads only; IMS is the single writer. Map via order_id (IMS branch order) '
  'or shipment_number to ecommerce.orders. Status: preparing, in_transit, delivered, failed.';

-- ────────────────────────────────────────────────────────────────────────────
-- Permissions: IMS trigger role must have write access
-- Replace 'postgres' with actual IMS DB role if your setup uses a different one
-- ────────────────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce.shipment_status TO postgres;

-- ────────────────────────────────────────────────────────────────────────────
-- RLS: Customers see shipment status only for their own orders
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE ecommerce.shipment_status ENABLE ROW LEVEL SECURITY;

-- Customers: read shipment status when it links to their order (via ims_order_id or shipment_number)
CREATE POLICY "customer_select_own_shipment_status"
  ON ecommerce.shipment_status FOR SELECT
  USING (
    -- Match by IMS order id (stored on ecommerce.orders when order goes to IMS)
    EXISTS (
      SELECT 1 FROM ecommerce.orders o
      WHERE o.ims_order_id = ecommerce.shipment_status.order_id
        AND o.customer_id = auth.uid()
    )
    OR
    -- Match by shipment/tracking number (stored on ecommerce.orders when available)
    EXISTS (
      SELECT 1 FROM ecommerce.orders o
      WHERE o.shipment_number = ecommerce.shipment_status.shipment_number
        AND o.shipment_number IS NOT NULL
        AND o.customer_id = auth.uid()
    )
  );

-- Admins can read all
CREATE POLICY "admin_select_all_shipment_status"
  ON ecommerce.shipment_status FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
