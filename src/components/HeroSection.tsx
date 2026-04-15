import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

/** Longer interval so each slide is readable with slow track motion */
const AUTOPLAY_MS = 9000;

/** Slide track: horizontal pan (same ease & direction); slower “slow motion” */
const SLIDE_TRANSITION = {
  duration: 2.45,
  ease: [0.16, 1, 0.3, 1] as const,
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
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                initial={false}
                animate={
                  i === current && autoplayOn
                    ? {
                        scale: 1.04,
                        transition: { duration: AUTOPLAY_MS / 1000, ease: "linear" },
                      }
                    : { scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                }
              />
            </div>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-banner-scrim" />
        <div className="pointer-events-none absolute inset-0 bg-hero-depth" aria-hidden />
      </div>

      <motion.div
        className="pointer-events-none container relative mx-auto flex min-h-[500px] items-center px-4 py-16 md:min-h-[580px] md:px-8 md:py-20"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-auto max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={textBlockVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mb-3 inline-block rounded-full bg-white/18 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur-sm ring-1 ring-white/25">
                {slide.badge}
              </span>
              <h1 className="mb-3 font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] md:text-5xl lg:text-6xl">
                {slide.title}{" "}
                <span className="text-accent drop-shadow-sm">{slide.highlight}</span>
              </h1>
              <p className="mb-7 max-w-md font-body text-base leading-relaxed text-white/90 md:text-lg md:leading-relaxed">
                {slide.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-full px-8 font-semibold shadow-lg shadow-black/20"
                  asChild
                >
                  <Link to={slide.ctaLink}>{slide.cta}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-white/50 bg-transparent px-8 font-semibold text-white shadow-none ring-0 backdrop-blur-md transition-all duration-300 ease-in-out hover:!scale-[1.02] hover:!border-white/70 hover:!bg-white hover:!text-foreground hover:!shadow-xl"
                  asChild
                >
                  <Link to={slide.secondaryLink}>{slide.secondaryCta}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDot(i)}
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              i === current ? "w-8 bg-white shadow-sm shadow-white/30" : "w-2 bg-white/35 hover:bg-white/55"
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current}
          />
        ))}
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
