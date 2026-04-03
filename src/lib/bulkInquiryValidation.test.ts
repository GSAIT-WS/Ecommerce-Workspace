import { describe, it, expect } from "vitest";
import { validateBulkInquiryForm } from "./bulkInquiryValidation";

const validBase = {
  name: "Jane Doe",
  business: "Acme Store",
  phone: "+91 9876543210",
  email: "jane@acme.com",
  quantity: "100",
  message: "Need delivery by next month.",
};

describe("validateBulkInquiryForm", () => {
  it("returns null for valid input", () => {
    expect(validateBulkInquiryForm(validBase)).toBeNull();
  });

  it("rejects empty name", () => {
    expect(validateBulkInquiryForm({ ...validBase, name: "  " })).toBeTruthy();
  });

  it("rejects short phone", () => {
    expect(validateBulkInquiryForm({ ...validBase, phone: "123" })).toBeTruthy();
  });

  it("rejects invalid email", () => {
    expect(validateBulkInquiryForm({ ...validBase, email: "not-an-email" })).toBeTruthy();
  });

  it("rejects quantity below 25", () => {
    expect(validateBulkInquiryForm({ ...validBase, quantity: "10" })).toBeTruthy();
  });
});
