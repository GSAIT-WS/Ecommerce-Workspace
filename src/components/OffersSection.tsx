import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import offerSlide1 from "@/assets/offer-slide-1.jpg";
import offerSlide2 from "@/assets/offer-slide-2.jpg";
import offerSlide3 from "@/assets/offer-slide-3.jpg";
import offerSlide4 from "@/assets/offer-slide-4.jpg";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

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
    cardTint: "from-[hsl(28_48%_97%)] via-[hsl(33_40%_96%)] to-primary/[0.07]",
    title: "First Order Discount",
    subtitle: "Use code CRUNCHFIRST at checkout",
  },
  {
    value: "Free",
    circleClass: "bg-secondary/18 text-secondary ring-2 ring-secondary/30",
    cardTint: "from-[hsl(84_22%_95%)] via-[hsl(33_35%_96%)] to-secondary/[0.1]",
    title: "Free Delivery",
    subtitle: `On all orders of ₹${FREE_SHIPPING_THRESHOLD}+ across India`,
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
    <section className="border-t border-border/50 bg-gradient-to-b from-[hsl(33_40%_93%)] to-[hsl(28_50%_96%)] py-12 shadow-[inset_0_1px_0_0_hsl(var(--border)/0.35)] dark:border-border/30 dark:from-muted/25 dark:to-background md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="section-heading mb-9 md:mb-12">
          <span className="eyebrow eyebrow-centered mb-3">Limited time</span>
          <h2 className="section-title">
            Offers &amp; <span className="text-gradient">Combos</span>
          </h2>
          <p className="section-subtitle">
            Grab value packs and save more on your favourites
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div
            className="group relative overflow-hidden rounded-2xl shadow-card ring-1 ring-border/40 transition-shadow duration-500 ease-smooth hover:shadow-card-elevated-hover md:col-span-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
              setIsPaused(false);
            }}
          >
            <div className="relative h-72 md:h-96">
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
                    <span className="mb-3 inline-block rounded-full bg-accent px-3.5 py-1 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-accent-foreground animate-offer-badge-pulse">
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

            <div className="glass-panel absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-2">
              {offerSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDot(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-smooth ${
                    i === current
                      ? "w-7 bg-gradient-to-r from-accent to-primary shadow-sm shadow-accent/40"
                      : "w-1.5 bg-white/45 hover:scale-y-150 hover:bg-white/70"
                  }`}
                  aria-label={`Go to offer ${i + 1}`}
                  aria-current={i === current}
                />
              ))}
            </div>
          </div>

          {miniOffers.map((offer, i) => (
            <div
              key={i}
              className={`card-interactive group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${offer.cardTint} p-6 shadow-card md:p-7`}
            >
              {/* Sheen sweep across the tile on hover */}
              <span
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-sheen-sweep dark:via-white/10"
                aria-hidden
              />
              <div
                className={`glow-gold flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-extrabold transition-transform duration-300 ease-smooth group-hover:scale-105 ${offer.circleClass}`}
              >
                {offer.value}
              </div>
              <div className="min-w-0">
                <h4 className="mb-1 font-display text-base font-bold tracking-[-0.02em] text-foreground transition-colors duration-300 group-hover:text-primary">
                  {offer.title}
                </h4>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">
                  {offer.subtitle}
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

OffersSection.displayName = "OffersSection";
export default OffersSection;
