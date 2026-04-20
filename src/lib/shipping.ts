export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_DELIVERY_FEE = 49;

export const getAmountLeftForFreeShipping = (subtotal: number) => {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
};
