/**
 * Shared types for backend service layer.
 * Aligned with DB (e.g. public.order_status) and API contracts.
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  name?: string;
}

export interface OrderInput {
  items: OrderItemInput[];
  delivery_charge?: number;
  discount_amount?: number;
  address?: Record<string, unknown>;
}

export interface OrderTotals {
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

export interface CartItemInput {
  product_id?: string;
  quantity: number;
  unit_price: number;
  /** When present, item is a combo; use unit_price and quantity from cart. */
  item_type?: 'product' | 'combo';
  combo_id?: string | null;
  customization_json?: ComboCustomization | null;
}

/** Combo/gift customization stored in cart_items.customization_json */
export interface ComboCustomization {
  items: { product_id: string; quantity: number }[];
  gift_wrap?: boolean;
  gift_message?: string;
}

export interface CartTotals {
  subtotal: number;
  itemCount: number;
}

/** Request body for create-online-order Edge Function */
export interface CreateOnlineOrderRequest {
  customer_id: string;
  cart_id: string;
  coupon_code?: string | null;
  shipping_amount?: number;
  shipping_address?: Record<string, unknown> | null;
}

/** Successful result from ecommerce.create_online_order RPC */
export interface CreateOnlineOrderResult {
  success: true;
  order_id: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
}

/** Error result from ecommerce.create_online_order RPC */
export interface CreateOnlineOrderError {
  success: false;
  error: string;
  message: string;
  product_id?: string;
  requested?: number;
  available?: number;
}

/** Request body for place-order (blueprint: POST /api/orders) */
export interface PlaceOrderRequest {
  shipping_address: Record<string, unknown>;
  payment_method?: string;
  gift_option?: Record<string, unknown> | null;
  discount_type?: "none" | "bulk" | "combo";
  discount_amount?: number;
  shipping_amount?: number;
}

/** Success result from public.place_order RPC */
export interface PlaceOrderResult {
  success: true;
  order_id: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
}

/** Error result from public.place_order RPC */
export interface PlaceOrderError {
  success: false;
  error: string;
  message: string;
  product_id?: string;
  requested?: number;
  available?: number;
}

// --- Products & Categories (Phase 1) ---

/** Query params/body for list-products */
export interface ListProductsParams {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

/** Paginated products result */
export interface ListProductsResult {
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    category_id: string | null;
    image_url: string | null;
    is_active: boolean;
    nutrition_info: unknown;
    weight_grams: number | null;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

/** Request body for get-product-by-id */
export interface GetProductByIdParams {
  product_id: string;
}

/** Request/body for get-cart, add-to-cart, update-cart-item, remove-cart-item, clear-cart */
export interface GetCartParams {
  user_id: string;
}

export interface AddToCartParams {
  user_id: string;
  /** Required when item_type is 'product' */
  product_id?: string;
  quantity: number;
  /** 'product' (default) or 'combo' */
  item_type?: 'product' | 'combo';
  /** Required when item_type is 'combo': items, gift_wrap, gift_message */
  customization?: ComboCustomization;
}

export interface UpdateCartItemParams {
  user_id: string;
  /** For product items; use cart_item_id for combo items */
  product_id?: string;
  quantity: number;
  /** When set, identify item by cart row id (for combo items) */
  cart_item_id?: string;
}

export interface RemoveCartItemParams {
  user_id: string;
  /** For product items; use cart_item_id for combo items */
  product_id?: string;
  /** When set, remove by cart row id (for combo items) */
  cart_item_id?: string;
}

export interface ClearCartParams {
  user_id: string;
}

// --- Orders Read & Cancel (Phase: list-my-orders, get-order-by-id, cancel-order) ---

/** Request body for list-my-orders */
export interface ListMyOrdersParams {
  user_id: string;
  limit?: number;
  offset?: number;
}

/** Single order summary for list-my-orders */
export interface OrderSummary {
  id: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  subtotal?: number;
  discount_amount?: number;
  shipping_amount?: number;
}

/** Paginated list of orders */
export interface ListMyOrdersResult {
  items: OrderSummary[];
  total: number;
  limit: number;
  offset: number;
}

/** Request body for get-order-by-id */
export interface GetOrderByIdParams {
  user_id: string;
  order_id: string;
}

/** Order item for get-order-by-id */
export interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

/** Status history entry */
export interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  created_at: string;
}

/** Full order detail for get-order-by-id */
export interface GetOrderByIdResult {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  order_status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  discount_type: string | null;
  shipping_address: unknown;
  payment_ref: string | null;
  items: OrderItemDetail[];
  status_history?: OrderStatusHistoryEntry[];
}

/** Request body for cancel-order */
export interface CancelOrderParams {
  user_id: string;
  order_id: string;
}

// --- Payment (create-payment-intent, payment-webhook) ---

/** Request body for create-payment-intent */
export interface CreatePaymentIntentParams {
  user_id: string;
  order_id: string;
}

/** Success response for create-payment-intent (Stripe-ready or mock) */
export interface CreatePaymentIntentResult {
  success: true;
  payment_intent_id: string;
  client_secret?: string;
  amount_cents: number;
  currency: string;
  order_id: string;
}

/** Request body for payment-webhook (provider event payload) */
export interface PaymentWebhookParams {
  /** Provider payment intent id (e.g. pi_xxx); maps to payment_attempts.external_id */
  external_id: string;
  /** 'succeeded' | 'failed' */
  outcome: "succeeded" | "failed";
}
