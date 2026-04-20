import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  getAmountLeftForFreeShipping,
} from "@/lib/shipping";

describe("shipping constants and helpers", () => {
  it("keeps free shipping threshold and fee stable", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(500);
    expect(STANDARD_DELIVERY_FEE).toBe(49);
  });

  it("never returns negative amount left", () => {
    expect(getAmountLeftForFreeShipping(0)).toBe(500);
    expect(getAmountLeftForFreeShipping(499)).toBe(1);
    expect(getAmountLeftForFreeShipping(500)).toBe(0);
    expect(getAmountLeftForFreeShipping(600)).toBe(0);
  });
});
