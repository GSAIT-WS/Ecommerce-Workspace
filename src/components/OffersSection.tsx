import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import offerSlide1 from "@/assets/offer-slide-1.jpg";
import offerSlide2 from "@/assets/offer-slide-2.jpg";
import offerSlide3 from "@/assets/offer-slide-3.jpg";
import offerSlide4 from "@/assets/offer-slide-4.jpg";

const offerSlides = [
  {
    image: offerSlide1,
    badge: "20% OFF",
    title: "Peanut Millet Protein Bar",
    description: "Crunchy peanuts & millet crispies — your daily protein fix at a special price.",
    cta: "Shop Now",
  },
  {
    image: offerSlide2,
    badge: "15% OFF",
    title: "Sesame Millet Energy Bar",
    description: "Toasted sesame goodness meets wholesome millet. Light, crunchy & nutritious.",
    cta: "Grab Deal",
  },
  {
    image: offerSlide3,
    badge: "Buy 2 Get 1",
    title: "Coconut Millet Bar",
    description: "Tropical coconut flakes with millet crispies. Naturally sweet & energizing.",
    cta: "Shop Now",
  },
  {
    image: offerSlide4,
    badge: "Launch Offer",
    title: "Super Seeds Bar",
    description: "Watermelon, pumpkin & flax seeds with dates. The ultimate superfood bar.",
    cta: "Try Now",
  },
];

const miniOffers = [
  {
    value: "20%",
    colorClass: "bg-primary/10 text-primary",
    title: "First Order Discount",
    subtitle: "Use code CRUNCHFIRST at checkout",
  },
  {
    value: "Free",
    colorClass: "bg-secondary/10 text-secondary",
    title: "Free Delivery",
    subtitle: "On all orders above ₹499 across India",
  },
];

const OffersSection = memo(() => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % offerSlides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + offerSlides.length) % offerSlides.length), []);

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setIsPaused(false), 5000);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  useEffect(() => {
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, []);

  const handlePrev = () => { prev(); pauseTemporarily(); };
  const handleNext = () => { next(); pauseTemporarily(); };
  const handleDot = (i: number) => { setCurrent(i); pauseTemporarily(); };

  const slide = offerSlides[current];

  return (
    <section className="bg-muted/50 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Offers & Combos
          </h2>
          <p className="font-body text-muted-foreground">
            Grab value packs and save more on your favourites
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="relative overflow-hidden rounded-2xl shadow-md md:col-span-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); setIsPaused(false); }}
          >
            {offerSlides.map((s, i) => (
              <img
                key={i}
                src={s.image}
                alt={s.title}
                className={`h-64 w-full object-cover transition-opacity duration-500 ease-in-out md:h-80 ${
                  i === current ? "relative opacity-100" : "absolute inset-0 opacity-0"
                }`}
                loading="lazy"
              />
            ))}
            <div className="absolute inset-0 flex items-center bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent p-8 md:p-12">
              <div key={`offer-${current}`} className="animate-fade-in-up">
                <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 font-body text-xs font-bold text-accent-foreground">
                  {slide.badge}
                </span>
                <h3 className="mb-2 font-display text-2xl font-bold text-card md:text-3xl">
                  {slide.title}
                </h3>
                <p className="mb-4 max-w-sm font-body text-sm text-card/80">
                  {slide.description}
                </p>
                <Button className="rounded-full bg-primary px-6 font-body font-semibold text-primary-foreground hover:bg-primary/90">
                  {slide.cta}
                </Button>
              </div>
            </div>

            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/20 text-card backdrop-blur-sm transition-colors hover:bg-card/40"
              aria-label="Previous offer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/20 text-card backdrop-blur-sm transition-colors hover:bg-card/40"
              aria-label="Next offer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {offerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleDot(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-6 bg-card" : "w-1.5 bg-card/40"
                  }`}
                  aria-label={`Go to offer ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {miniOffers.map((offer, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold ${offer.colorClass}`}
              >
                {offer.value}
              </div>
              <div>
                <h4 className="font-body text-sm font-bold text-foreground">{offer.title}</h4>
                <p className="font-body text-xs text-muted-foreground">{offer.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

OffersSection.displayName = "OffersSection";
export default OffersSection;
