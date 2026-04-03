import { describe, it, expect } from "vitest";
import { unwrapEdgeData } from "./api";

describe("unwrapEdgeData", () => {
  it("returns data when success is true", () => {
    const r = unwrapEdgeData<{ x: number }>({ success: true, data: { x: 1 } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.x).toBe(1);
  });

  it("returns error when success is false", () => {
    const r = unwrapEdgeData({ success: false, error: "bad" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("bad");
  });

  it("rejects invalid bodies", () => {
    expect(unwrapEdgeData(null).ok).toBe(false);
    expect(unwrapEdgeData({ success: true }).ok).toBe(false);
  });
});
