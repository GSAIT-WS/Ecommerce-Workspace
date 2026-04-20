export type CheckoutPaymentState = {
  couponDiscount: number;
  couponCode: string | null;
  total: number;
  subtotal: number;
  delivery: number;
};

export function isCheckoutPaymentState(state: unknown): state is CheckoutPaymentState {
  if (!state || typeof state !== "object") return false;
  const value = state as Record<string, unknown>;
  const couponOk =
    value.couponCode === null ||
    value.couponCode === undefined ||
    typeof value.couponCode === "string";

  return (
    typeof value.total === "number" &&
    typeof value.subtotal === "number" &&
    typeof value.delivery === "number" &&
    typeof value.couponDiscount === "number" &&
    couponOk
  );
}

export function canProceedFromCheckout(params: {
  addressesCount: number;
  selectedAddressId?: string | null;
  hasToken: boolean;
}): boolean {
  return params.addressesCount > 0 && Boolean(params.selectedAddressId) && params.hasToken;
}

export function getCheckoutCtaLabel(params: {
  addressesCount: number;
  selectedAddressId?: string | null;
  hasToken: boolean;
}): string {
  if (params.addressesCount === 0) return "Add address to continue";
  if (!params.selectedAddressId) return "Select an address";
  if (!params.hasToken) return "Sign in to continue";
  return "Proceed to Payment";
}
