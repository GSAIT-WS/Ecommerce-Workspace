import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EASE } from "@/lib/motion";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

/** Longer interval so each slide is readable with slow track motion */
const AUTOPLAY_MS = 9000;

/** Slide track: horizontal pan (same ease & direction); slower “slow motion” */
const SLIDE_TRANSITION = {
  duration: 2.45,
  ease: EASE.smooth,
};

const slides = [
  {
    image: heroSlide1,
    badge: "Farm to Fork · Lambasingi",
    title: "Fuel Your Day",
    highlight: "the Natural Way",
    description: "Wholesome energy crafted from nature's finest ingredients.",
    cta: "Shop Now",
    ctaLink: "/search",
    secondaryCta: "Explore Categories",
    secondaryLink: "/categories",
  },
  {
    image: heroSlide2,
    badge: "New Arrival",
    title: "Clean Ingredients.",
    highlight: "Powerful Nutrition.",
    description: "Balanced snacking made simple and delicious.",
    cta: "Shop Now",
    ctaLink: "/search",
    secondaryCta: "Explore Categories",
    secondaryLink: "/categories",
  },
  {
    image: heroSlide3,
    badge: "Best Seller",
    title: "Smart Snacking",
    highlight: "for Active Lives",
    description: "High-energy bites designed for modern lifestyles.",
    cta: "Shop Now",
    ctaLink: "/search",
    secondaryCta: "Explore Categories",
    secondaryLink: "/categories",
  },
  {
    image: heroSlide4,
    badge: "Premium Pick",
    title: "Pure Taste.",
    highlight: "Real Strength.",
    description: "No shortcuts. Just honest nutrition in every bite.",
    cta: "Shop Now",
    ctaLink: "/search",
    secondaryCta: "Explore Categories",
    secondaryLink: "/categories",
  },
];

/** Short proof points under the hero CTAs — brand-consistent, no new data source */
const heroStats = [
  { value: "100%", label: "Natural" },
  { value: "7+", label: "Ancient Grains" },
  { value: "20g+", label: "Protein" },
];

const textBlockVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const HeroSection = memo(() => {
  const [current, setCurrent] = useState(0);
  /** After any tap on the banner (except links/dots), autoplay stops — use dots to navigate. */
  const [manualMode, setManualMode] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);

  useEffect(() => {
    if (manualMode) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [manualMode, next]);

  const goManual = () => setManualMode(true);

  const handleDot = (i: number) => {
    goManual();
    setCurrent(i);
  };

  /** Tap anywhere on the banner (except links & dot buttons) → pause autoplay; use dots to navigate. */
  const handleBannerPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    goManual();
  };

  const slide = slides[current];
  const slideFraction = 100 / slides.length;
  const autoplayOn = !manualMode;

  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onPointerDown={handleBannerPointerDown}
    >
      <div className="absolute inset-0">
        <motion.div
          className="flex h-full"
          style={{ width: `${slides.length * 100}%` }}
          animate={{ x: `${-(current * slideFraction)}%` }}
          transition={SLIDE_TRANSITION}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="relative h-full shrink-0 overflow-hidden"
              style={{ width: `${slideFraction}%` }}
            >
              <motion.img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                initial={false}
                animate={
                  i === current && autoplayOn
                    ? {
                        scale: 1.04,
                        transition: { duration: AUTOPLAY_MS / 1000, ease: "linear" },
                      }
                    : { scale: 1, transition: { duration: 0.7, ease: EASE.smooth } }
                }
              />
            </div>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-banner-scrim" />
        <div className="pointer-events-none absolute inset-0 bg-hero-depth" aria-hidden />
      </div>

      <motion.div
        className="pointer-events-none container relative mx-auto flex min-h-[520px] items-center px-4 py-20 md:min-h-[600px] md:px-8 md:py-24"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE.smooth }}
      >
        <div className="pointer-events-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={textBlockVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.55, ease: EASE.smooth }}
            >
              <span className="glass-panel mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {slide.badge}
              </span>
              <h1 className="mb-4 font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.45)] md:text-5xl lg:text-6xl">
                {slide.title}{" "}
                <span className="text-gradient-warm drop-shadow-sm">{slide.highlight}</span>
              </h1>
              <p className="mb-8 max-w-md font-body text-base leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)] md:text-lg">
                {slide.description}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="xl"
                  className="group rounded-full bg-gradient-to-b from-accent via-primary to-primary px-8 font-semibold text-white shadow-[0_12px_32px_-10px_hsl(var(--primary)/0.75)] ring-1 ring-inset ring-white/35 hover:from-accent hover:to-primary/90 hover:shadow-[0_18px_44px_-10px_hsl(var(--primary)/0.85)]"
                  asChild
                >
                  <Link to={slide.ctaLink}>
                    {slide.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="group rounded-full border-2 border-white/50 bg-white/5 px-8 font-semibold text-white shadow-none ring-1 ring-inset ring-white/20 backdrop-blur-md hover:!scale-[1.02] hover:!border-white/70 hover:!bg-white hover:!text-foreground hover:!shadow-xl"
                  asChild
                >
                  <Link to={slide.secondaryLink}>
                    {slide.secondaryCta}
                    <Compass className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:rotate-12" />
                  </Link>
                </Button>
              </div>

              {/* Trust strip — reinforces the brand without changing layout */}
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5">
                {heroStats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-extrabold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                      {s.value}
                    </span>
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="glass-panel absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDot(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ease-smooth ${
              i === current
                ? "w-9 bg-gradient-to-r from-accent to-primary shadow-sm shadow-accent/40"
                : "w-1.5 bg-white/45 hover:scale-y-150 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current}
          />
        ))}
      </div>

      {/* Slide progress bar — fills across the autoplay interval */}
      {autoplayOn && (
        <div
          key={`progress-${current}`}
          className="absolute bottom-0 left-0 z-20 h-[3px] bg-gradient-to-r from-accent via-primary to-secondary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
          style={{
            width: "100%",
            transformOrigin: "left",
            animation: `shrink-x ${AUTOPLAY_MS}ms linear forwards`,
          }}
          aria-hidden
        />
      )}
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
