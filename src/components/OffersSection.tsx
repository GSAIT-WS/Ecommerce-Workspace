import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import offerSlide1 from "@/assets/offer-slide-1.jpg";
import offerSlide2 from "@/assets/offer-slide-2.jpg";
import offerSlide3 from "@/assets/offer-slide-3.jpg";
import offerSlide4 from "@/assets/offer-slide-4.jpg";

// Offer slides — link to /search so CTAs always navigate correctly.
// Replace with real offers from backend when available.
const offerSlides = [
  {
    image: offerSlide1,
    badge: "20% OFF",
    title: "Peanut Millet Protein Bar",
    description: "Crunchy peanuts & millet crispies — your daily protein fix at a special price.",
    cta: "Shop Now",
    ctaLink: "/search",
  },
  {
    image: offerSlide2,
    badge: "15% OFF",
    title: "Sesame Millet Energy Bar",
    description: "Toasted sesame goodness meets wholesome millet. Light, crunchy & nutritious.",
    cta: "Grab Deal",
    ctaLink: "/search",
  },
  {
    image: offerSlide3,
    badge: "Buy 2 Get 1",
    title: "Coconut Millet Bar",
    description: "Tropical coconut flakes with millet crispies. Naturally sweet & energizing.",
    cta: "Shop Now",
    ctaLink: "/search",
  },
  {
    image: offerSlide4,
    badge: "Launch Offer",
    title: "Super Seeds Bar",
    description: "Watermelon, pumpkin & flax seeds with dates. The ultimate superfood bar.",
    cta: "Try Now",
    ctaLink: "/search",
  },
];

const miniOffers = [
  {
    value: "20%",
    circleClass: "bg-primary/20 text-primary ring-2 ring-primary/25",
    cardTint: "from-[hsl(38_42%_96%)] via-[hsl(38_38%_97%)] to-primary/[0.06]",
    title: "First Order Discount",
    subtitle: "Use code CRUNCHFIRST at checkout",
  },
  {
    value: "Free",
    circleClass: "bg-secondary/18 text-secondary ring-2 ring-secondary/30",
    cardTint: "from-[hsl(148_28%_96%)] via-[hsl(40_30%_97%)] to-secondary/[0.08]",
    title: "Free Delivery",
    subtitle: "On all orders above ₹499 across India",
  },
];

const slideMotion = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -22 },
};

/** Same horizontal slide direction & easing; slower “slow motion” on the image strip */
const slideImageTransition = { duration: 1.45, ease: [0.22, 1, 0.36, 1] as const };
const slideCopyTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

const OFFER_AUTOPLAY_MS = 7500;

const OffersSection = memo(() => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % offerSlides.length), []);

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setIsPaused(false), 5000);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, OFFER_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, next]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const handleDot = (i: number) => {
    setCurrent(i);
    pauseTemporarily();
  };

  const slide = offerSlides[current];

  return (
    <section className="border-t border-border/50 bg-[hsl(38_34%_95%)] py-12 shadow-[inset_0_1px_0_0_hsl(var(--border)/0.35)] dark:border-border/30 dark:bg-muted/20 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Offers & Combos
          </h2>
          <p className="font-body text-[15px] leading-relaxed text-muted-foreground">
            Grab value packs and save more on your favourites
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div
            className="relative overflow-hidden rounded-2xl shadow-card ring-1 ring-border/40 md:col-span-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
              setIsPaused(false);
            }}
          >
            <div className="relative h-64 md:h-80">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current}
                  className="absolute inset-0"
                  initial={slideMotion.initial}
                  animate={slideMotion.animate}
                  exit={slideMotion.exit}
                  transition={slideImageTransition}
                >
                  <img
                    src={offerSlides[current].image}
                    alt={offerSlides[current].title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-offers-carousel-overlay" aria-hidden />
            </div>

            <div className="pointer-events-none absolute inset-0 z-[2] flex items-center p-8 md:p-12">
              <div className="pointer-events-auto max-w-xl">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`offer-copy-${current}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={slideCopyTransition}
                  >
                    <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 font-body text-xs font-bold text-accent-foreground animate-offer-badge-pulse">
                      {slide.badge}
                    </span>
                    <h3 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] md:text-3xl">
                      {slide.title}
                    </h3>
                    <p className="mb-5 max-w-sm font-body text-sm leading-relaxed text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
                      {slide.description}
                    </p>
                    <div className="group/cta relative inline-flex">
                      <span
                        className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full bg-primary/50 opacity-60 blur-xl transition-all duration-300 ease-out group-hover/cta:opacity-90 group-hover/cta:blur-2xl"
                        aria-hidden
                      />
                      <Link
                        to={slide.ctaLink}
                        className="relative inline-flex h-11 items-center justify-center overflow-visible rounded-full bg-gradient-to-b from-accent/95 via-primary to-primary/95 px-7 font-body text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-8px_hsl(var(--primary)/0.55),0_4px_12px_-4px_hsl(var(--accent)/0.35)] ring-offset-background transition-all duration-300 ease-out hover:-translate-y-1 hover:from-accent hover:via-primary hover:to-primary/90 hover:shadow-[0_14px_36px_-6px_hsl(var(--primary)/0.6),0_0_40px_-6px_hsl(var(--accent)/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <span
                          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-white/10 to-transparent opacity-40"
                          aria-hidden
                        />
                        <span className="relative">{slide.cta}</span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {offerSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDot(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    i === current ? "w-6 bg-white shadow-sm shadow-white/25" : "w-1.5 bg-white/40 hover:bg-white/55"
                  }`}
                  aria-label={`Go to offer ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {miniOffers.map((offer, i) => (
            <div
              key={i}
              className={`group flex items-center gap-4 rounded-2xl border border-border/60 bg-gradient-to-br ${offer.cardTint} p-6 shadow-card transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover md:p-7`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-2xl font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_5px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out group-hover:scale-105 ${offer.circleClass}`}
              >
                {offer.value}
              </div>
              <div>
                <h4 className="font-body text-sm font-bold text-foreground">{offer.title}</h4>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">{offer.subtitle}</p>
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
