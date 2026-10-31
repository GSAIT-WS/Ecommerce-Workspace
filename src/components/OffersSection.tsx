import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import offerSlide1 from "@/assets/offer-slide-1.jpg";
import offerSlide2 from "@/assets/offer-slide-2.jpg";
import offerSlide3 from "@/assets/offer-slide-3.jpg";
import offerSlide4 from "@/assets/offer-slide-4.jpg";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import Reveal from "@/components/motion/Reveal";
import { EASE, revealTile, staggerContainer, viewportOnce } from "@/lib/motion";

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
    circleClass: "bg-brand-purple text-brand-cream",
    surface: "bg-surface-cream/75 dark:bg-surface-cream",
    title: "First Order Discount",
    subtitle: "Use code CRUNCHFIRST at checkout",
  },
  {
    value: "Free",
    circleClass: "bg-brand-green text-brand-deep",
    surface: "bg-surface-green/85 dark:bg-surface-green",
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
const slideImageTransition = { duration: 1.45, ease: EASE.smooth };
const slideCopyTransition = { duration: 0.55, ease: EASE.smooth };

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
    <section className="border-y border-border/50 bg-surface-purple/45 py-14 dark:bg-surface-purple/50 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <Reveal distance={14} amount={0.2}>
          <div className="section-heading mb-9 md:mb-12">
            <span className="eyebrow eyebrow-centered mb-3">Limited time</span>
            <h2 className="section-title">Offers</h2>
            <p className="section-subtitle">
              Save more on your favourites
            </p>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce(0.12)}
          className="grid gap-4 md:grid-cols-2 md:gap-5"
        >
          <motion.div
            variants={revealTile}
            className="group relative overflow-hidden rounded-[2rem] border border-border/70 shadow-card ring-1 ring-black/[0.03] transition-shadow duration-500 ease-smooth hover:shadow-card-elevated-hover md:col-span-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
              setIsPaused(false);
            }}
          >
            <div className="relative h-[21rem] md:h-[26rem]">
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

            <div className="pointer-events-none absolute inset-0 z-[2] flex items-end p-5 sm:items-center sm:p-9 md:p-12">
              <div className="pointer-events-auto max-w-xl">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`offer-copy-${current}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={slideCopyTransition}
                  >
                    <span className="mb-3 inline-block rounded-full bg-brand-gold px-3.5 py-1 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep animate-offer-badge-pulse">
                      {slide.badge}
                    </span>
                    <h3 className="mb-2 max-w-md font-brand text-[1.55rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:text-3xl md:text-4xl">
                      {slide.title}
                    </h3>
                    <p className="mb-4 max-w-[19rem] font-body text-xs leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] sm:mb-5 sm:max-w-sm sm:text-sm">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.ctaLink}
                      className="group/cta inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-gold px-5 font-body text-[13px] font-bold text-brand-deep shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 sm:h-11 sm:px-6 sm:text-sm"
                    >
                      {slide.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover/cta:translate-x-0.5" />
                    </Link>
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
                      ? "w-7 bg-brand-gold shadow-sm shadow-black/20"
                      : "w-1.5 bg-white/50 hover:scale-y-150 hover:bg-white/80"
                  }`}
                  aria-label={`Go to offer ${i + 1}`}
                  aria-current={i === current}
                />
              ))}
            </div>
          </motion.div>

          {miniOffers.map((offer, i) => (
            <motion.div
              key={i}
              variants={revealTile}
              className={`card-interactive group relative flex items-center gap-4 overflow-hidden rounded-[1.5rem] border border-border/70 p-6 shadow-card md:gap-5 md:p-7 ${offer.surface}`}
            >
              <span
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
                aria-hidden
              />
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-brand text-2xl font-semibold shadow-sm transition-transform duration-300 ease-smooth group-hover:-rotate-3 group-hover:scale-105 ${offer.circleClass}`}
              >
                {offer.value}
              </div>
              <div className="min-w-0">
                <h4 className="mb-1 font-brand text-lg font-semibold tracking-[-0.015em] text-primary">
                  {offer.title}
                </h4>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">
                  {offer.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

OffersSection.displayName = "OffersSection";
export default OffersSection;
