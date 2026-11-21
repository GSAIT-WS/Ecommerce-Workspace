import { describe, expect, it } from "vitest";
import { formatProductName } from "./productName";

describe("formatProductName", () => {
  it("uses consistent title case for product names", () => {
    expect(formatProductName("Jowar peanut chikki")).toBe("Jowar Peanut Chikki");
    expect(formatProductName("kurmura PEANUT jar")).toBe("Kurmura Peanut Jar");
    expect(formatProductName("Sesame peanut chikki")).toBe("Sesame Peanut Chikki");
  });

  it("preserves brand and technical acronyms", () => {
    expect(formatProductName("purvita fssai snack")).toBe("PURVITA FSSAI Snack");
  });

  it("uses standard casing for minor words and preserves intentional mixed case", () => {
    expect(formatProductName("PURVITA family And sharing pack")).toBe(
      "PURVITA Family and Sharing Pack",
    );
    expect(formatProductName("eBay snack")).toBe("eBay Snack");
  });
});
