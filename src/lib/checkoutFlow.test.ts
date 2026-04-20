import { describe, expect, it } from "vitest";
import {
  canProceedFromCheckout,
  getCheckoutCtaLabel,
  isCheckoutPaymentState,
} from "@/lib/checkoutFlow";

describe("checkout flow guards", () => {
  it("validates payment route state shape", () => {
    expect(
      isCheckoutPaymentState({
        couponDiscount: 10,
        couponCode: "CRUNCHFIRST",
        total: 200,
        subtotal: 220,
        delivery: 0,
      }),
    ).toBe(true);
    expect(isCheckoutPaymentState({ total: 200 })).toBe(false);
  });

  it("allows proceed only when address and token exist", () => {
    expect(
      canProceedFromCheckout({
        addressesCount: 1,
        selectedAddressId: "addr_1",
        hasToken: true,
      }),
    ).toBe(true);

    expect(
      canProceedFromCheckout({
        addressesCount: 0,
        selectedAddressId: "addr_1",
        hasToken: true,
      }),
    ).toBe(false);
  });

  it("returns consistent checkout CTA labels", () => {
    expect(
      getCheckoutCtaLabel({ addressesCount: 0, selectedAddressId: null, hasToken: false }),
    ).toBe("Add address to continue");
    expect(
      getCheckoutCtaLabel({ addressesCount: 1, selectedAddressId: null, hasToken: true }),
    ).toBe("Select an address");
    expect(
      getCheckoutCtaLabel({ addressesCount: 1, selectedAddressId: "addr", hasToken: false }),
    ).toBe("Sign in to continue");
    expect(
      getCheckoutCtaLabel({ addressesCount: 1, selectedAddressId: "addr", hasToken: true }),
    ).toBe("Proceed to Payment");
  });
});
