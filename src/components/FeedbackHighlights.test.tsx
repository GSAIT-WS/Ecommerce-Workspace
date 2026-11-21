import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeedbackHighlights from "./FeedbackHighlights";

vi.mock("@/components/motion/Reveal", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

describe("FeedbackHighlights", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("keeps the feedback cards statically touch-scrollable and advances by one card on arrow input", () => {
    act(() => root.render(<FeedbackHighlights id="contact" />));

    const region = container.querySelector('[aria-label="Sample customer reviews"]');
    const contactAnchor = container.querySelector("#contact");
    const previousButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Previous reviews"]',
    );
    const nextButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Next reviews"]',
    );
    const firstCard = container.querySelector("article");

    expect(region).not.toBeNull();
    expect(region?.className).toContain("overflow-x-auto");
    expect(region?.className).toContain("[touch-action:pan-x]");
    expect(region?.className).not.toContain("animate-marquee");
    expect(contactAnchor?.tagName).toBe("SECTION");
    expect(container.querySelectorAll("article")).toHaveLength(5);
    expect(container.textContent).toContain("not verified customer testimonials");
    expect(
      Array.from(container.querySelectorAll("article")).every((card) =>
        card.textContent?.includes("Sample"),
      ),
    ).toBe(true);

    if (!region || !previousButton || !nextButton || !firstCard) {
      throw new Error("Feedback scroller controls were not rendered");
    }

    Object.defineProperties(region, {
      clientWidth: { configurable: true, value: 320 },
      scrollWidth: { configurable: true, value: 960 },
      scrollLeft: { configurable: true, value: 0 },
      scrollBy: { configurable: true, value: vi.fn() },
    });
    vi.spyOn(firstCard, "getBoundingClientRect").mockReturnValue({
      width: 304,
    } as DOMRect);

    act(() => region.dispatchEvent(new Event("scroll")));

    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    act(() => nextButton.click());

    expect(region.scrollBy).toHaveBeenCalledWith({ left: 304, behavior: "smooth" });
  });
});
