import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/motion/Reveal";

const sampleReviews = [
  {
    reviewer: "Sample Customer 1",
    product: "Jowar Peanut Chikki",
    rating: 5,
    title: "A lovely crunchy snack",
    content: "The chikki has a satisfying crunch and a sweetness I enjoy with my evening tea.",
  },
  {
    reviewer: "Sample Customer 2",
    product: "Kurmura Peanut Chikki",
    rating: 5,
    title: "Light and crisp",
    content: "I like the light crunch of the kurmura chikki. It makes a nice afternoon snack.",
  },
  {
    reviewer: "Sample Customer 3",
    product: "Sesame Peanut Chikki",
    rating: 4,
    title: "Great sesame flavour",
    content: "The sesame and peanut combination is tasty, and the texture is pleasantly crunchy.",
  },
  {
    reviewer: "Sample Customer 4",
    product: "Variety Pack",
    rating: 5,
    title: "Fun to share",
    content: "The variety pack makes it easy to try different flavours and share them with family.",
  },
  {
    reviewer: "Sample Customer 5",
    product: "Jowar Peanut Jar",
    rating: 4,
    title: "Handy jar",
    content: "The jar is convenient to keep at home when I want a quick traditional snack.",
  },
];

const FeedbackHighlights = ({ id }: { id?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    setCanScrollPrev(element.scrollLeft > 0);
    setCanScrollNext(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    updateScrollState();

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollReviews = (direction: -1 | 1) => {
    const element = scrollRef.current;
    if (!element) return;

    const firstCard = element.querySelector("article");
    const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0;
    const scrollAmount = (firstCard?.getBoundingClientRect().width ?? element.clientWidth) + gap;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

    element.scrollBy({ left: direction * scrollAmount, behavior });
  };

  return (
    <section id={id} className="mb-10 scroll-mt-20" aria-labelledby="feedback-heading">
      <Reveal distance={12} amount={0.15}>
        <div className="mb-5 text-center">
          <h3
            id="feedback-heading"
            className="font-brand text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl"
          >
            Customer Reviews
          </h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sample reviews for preview only; these are not verified customer testimonials.
          </p>
        </div>
      </Reveal>

      <div>
        <div className="mb-2 hidden justify-end gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => scrollReviews(-1)}
            disabled={!canScrollPrev}
            aria-label="Previous reviews"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => scrollReviews(1)}
            disabled={!canScrollNext}
            aria-label="Next reviews"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div
          ref={scrollRef}
          role="region"
          aria-label="Sample customer reviews"
          tabIndex={0}
          className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain px-1 pb-3 [scrollbar-width:thin] [touch-action:pan-x] scroll-smooth sm:gap-5"
        >
          {sampleReviews.map((review) => (
            <article
              key={review.reviewer}
              className="flex w-[min(76vw,20rem)] shrink-0 snap-start flex-col rounded-2xl border border-border/70 bg-card/90 p-4 shadow-card sm:w-[19rem] sm:p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div
                    className="flex items-center gap-0.5 text-brand-gold"
                    aria-label={`Sample rating: ${review.rating} out of 5`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-muted-foreground/30"}`}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="mt-1 font-body text-sm font-medium text-foreground">
                    {review.reviewer}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Sample
                </span>
              </div>
              <h4 className="font-brand text-lg font-semibold text-primary">
                {review.title}
              </h4>
              <p className="mt-1.5 flex-1 font-body text-sm leading-relaxed text-muted-foreground">
                &ldquo;{review.content}&rdquo;
              </p>
              <p className="mt-4 border-t border-border/60 pt-3 font-body text-xs text-muted-foreground">
                Product: {review.product}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackHighlights;
