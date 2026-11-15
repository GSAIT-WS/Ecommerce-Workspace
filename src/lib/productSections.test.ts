import { describe, expect, it } from "vitest";
import { PRODUCT_IMAGE_PLACEHOLDER } from "./productImagePlaceholder";
import type { Product } from "./productsApi";
import {
  buildProductSections,
  dedupeProducts,
  getProductSectionId,
} from "./productSections";

let nextId = 0;

function makeProduct(
  name: string,
  price = 10,
  image = "https://example.com/product.jpg",
): Product {
  nextId += 1;
  return {
    id: `product-${nextId}`,
    name,
    tag: "Product",
    price,
    rating: 4.5,
    image,
    category: "",
    isActive: true,
    isInDeletionPeriod: false,
  };
}

describe("getProductSectionId", () => {
  it("classifies singles, combos and jars from production-style names", () => {
    expect(getProductSectionId("Jowar peanut chikki")).toBe("singles");
    expect(getProductSectionId("Kurmura peanut chikki")).toBe("singles");
    expect(getProductSectionId("PURVITA Discovery pack")).toBe("combos");
    expect(getProductSectionId("PURVITA Variety pack")).toBe("combos");
    expect(getProductSectionId("PURVITA Family and sharing pack")).toBe("combos");
    expect(getProductSectionId("Jowar peanut jar")).toBe("jars");
    expect(getProductSectionId("Kurmura Peanut JAR")).toBe("jars");
  });
});

describe("dedupeProducts", () => {
  it("keeps one record per name/price and prefers a real product image", () => {
    const withoutImage = makeProduct(
      "Jowar peanut chikki",
      10,
      PRODUCT_IMAGE_PLACEHOLDER,
    );
    const withImage = makeProduct(
      "  jowar   peanut chikki ",
      10,
      "https://example.com/jowar.jpg",
    );
    const olderDuplicate = makeProduct(
      "Jowar peanut chikki",
      10,
      PRODUCT_IMAGE_PLACEHOLDER,
    );

    const result = dedupeProducts([withoutImage, withImage, olderDuplicate]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(withImage.id);
  });

  it("does not merge products with the same name at different prices", () => {
    const single = makeProduct("Jowar peanut chikki", 10);
    const largerPack = makeProduct("Jowar peanut chikki", 60);

    expect(dedupeProducts([single, largerPack])).toHaveLength(2);
  });
});

describe("buildProductSections", () => {
  const products = [
    makeProduct("Sesame peanut chikki", 10),
    makeProduct("Jowar peanut jar", 500),
    makeProduct("PURVITA Family and sharing pack", 300),
    makeProduct("Kurmura peanut chikki", 10),
    makeProduct("Purvita Discovery pack", 60),
    makeProduct("Kurmura peanut jar", 500),
    makeProduct("Jowar peanut chikki", 10),
    makeProduct("PURVITA Variety pack", 120),
    makeProduct("Sesame peanut jar", 500),
  ];

  it("orders sections and defaults to the storefront's curated order", () => {
    const sections = buildProductSections(products);

    expect(sections.map((section) => section.id)).toEqual([
      "singles",
      "combos",
      "jars",
    ]);
    expect(sections.map((section) => section.products.map((product) => product.name))).toEqual([
      ["Jowar peanut chikki", "Kurmura peanut chikki", "Sesame peanut chikki"],
      ["Purvita Discovery pack", "PURVITA Variety pack", "PURVITA Family and sharing pack"],
      ["Jowar peanut jar", "Kurmura peanut jar", "Sesame peanut jar"],
    ]);
  });

  it("applies explicit price sorting within each section", () => {
    const sections = buildProductSections(products, "Price: High to Low");
    const combos = sections.find((section) => section.id === "combos");

    expect(combos?.products.map((product) => product.price)).toEqual([300, 120, 60]);
  });

  it("omits sections with no matching products", () => {
    const sections = buildProductSections([makeProduct("Sesame peanut jar", 500)]);

    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe("jars");
  });
});
