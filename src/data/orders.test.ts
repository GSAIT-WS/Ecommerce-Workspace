import { describe, it, expect } from "vitest";
import { normalizeOrderStatus } from "./orders";

describe("normalizeOrderStatus", () => {
  it("maps known API statuses", () => {
    expect(normalizeOrderStatus("delivered")).toBe("delivered");
    expect(normalizeOrderStatus("pending")).toBe("pending");
  });

  it("falls back to pending for unknown values", () => {
    expect(normalizeOrderStatus("unknown")).toBe("pending");
  });
});
