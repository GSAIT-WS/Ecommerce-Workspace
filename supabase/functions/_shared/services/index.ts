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
  validateAddAddressParams,
  validateUpdateAddressParams,
} from "./addressService.ts";
export {
  validateListProductsParams,
  validateGetProductByIdParams,
} from "./productService.ts";
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
} from "./ordersReadService.ts";
export { validateCreatePaymentIntentParams } from "./paymentIntentService.ts";
export { validatePaymentWebhookParams } from "./paymentWebhookService.ts";
export type {
  OrderItemInput,
  OrderInput,
  OrderTotals,
  CartItemInput,
  ComboCustomization,
  CartTotals,
  CreateOnlineOrderRequest,
  CreateOnlineOrderResult,
  CreateOnlineOrderError,
  AddAddressParams,
  UpdateAddressParams,
  ListProductsParams,
  GetProductByIdParams,
  GetCartParams,
  AddToCartParams,
  UpdateCartItemParams,
  RemoveCartItemParams,
  ClearCartParams,
  ListMyOrdersParams,
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
