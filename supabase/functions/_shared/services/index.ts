/**
 * Service layer — re-export for Edge Functions.
 * Import from here: import { orderService, cartService } from "../_shared/services/index.ts"
 */

export {
  validateOrderInput,
  calculateOrderTotals,
} from "./orderService.ts";
export {
  validateCartItems,
  calculateCartTotals,
} from "./cartService.ts";
export {
  validateCreateOrderRequest,
  normalizeCreateOrderPayload,
} from "./onlineOrderService.ts";
export {
  validatePlaceOrderRequest,
  normalizePlaceOrderPayload,
} from "./placeOrderService.ts";
export {
  validateListProductsParams,
  validateGetProductByIdParams,
} from "./productService.ts";
export { validateListCategoriesParams } from "./categoryService.ts";
export {
  validateGetCartParams,
  validateAddToCartParams,
  validateUpdateCartItemParams,
  validateRemoveCartItemParams,
  validateClearCartParams,
} from "./cartCrudService.ts";
export {
  validateListMyOrdersParams,
  validateGetOrderByIdParams,
  validateCancelOrderParams,
  isCancellableStatus,
} from "./ordersReadService.ts";
export { validateCreatePaymentIntentParams } from "./paymentIntentService.ts";
export { validatePaymentWebhookParams } from "./paymentWebhookService.ts";
export type {
  OrderStatus,
  OrderItemInput,
  OrderInput,
  OrderTotals,
  CartItemInput,
  ComboCustomization,
  CartTotals,
  CreateOnlineOrderRequest,
  CreateOnlineOrderResult,
  CreateOnlineOrderError,
  PlaceOrderRequest,
  PlaceOrderResult,
  PlaceOrderError,
  ListProductsParams,
  ListProductsResult,
  GetProductByIdParams,
  GetCartParams,
  AddToCartParams,
  UpdateCartItemParams,
  RemoveCartItemParams,
  ClearCartParams,
  ListMyOrdersParams,
  ListMyOrdersResult,
  OrderSummary,
  GetOrderByIdParams,
  GetOrderByIdResult,
  OrderItemDetail,
  OrderStatusHistoryEntry,
  CancelOrderParams,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  PaymentWebhookParams,
} from "./types.ts";
