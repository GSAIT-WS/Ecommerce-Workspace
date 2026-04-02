import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

const AUTOPLAY_MS = 5500;

/** Slide track: long, smooth ease */
const SLIDE_TRANSITION = {
  duration: 1.05,
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
  /** After any tap on the banner (or using arrows/dots), autoplay stops — only manual navigation. */
  const [manualMode, setManualMode] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (manualMode) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [manualMode, next]);

  const goManual = () => setManualMode(true);

  const handlePrev = () => {
    goManual();
    prev();
  };
  const handleNext = () => {
    goManual();
    next();
  };
  const handleDot = (i: number) => {
    goManual();
    setCurrent(i);
  };

  /** Tap anywhere on the banner (except links & arrow/dot buttons) → pause autoplay, use arrows/dots only. */
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
      </div>

      <div className="pointer-events-none container relative mx-auto flex min-h-[520px] items-center px-4 py-20 md:min-h-[600px] md:px-8">
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
              <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur-sm ring-1 ring-white/20">
                {slide.badge}
              </span>
              <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
                {slide.title}{" "}
                <span className="text-accent">{slide.highlight}</span>
              </h1>
              <p className="mb-8 max-w-md font-body text-base leading-relaxed text-white/88 md:text-lg">
                {slide.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full px-8 font-semibold shadow-lg shadow-primary/25" asChild>
                  <Link to={slide.ctaLink}>{slide.cta}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-2 border-white/45 bg-white/10 px-8 font-semibold text-white backdrop-blur-md hover:bg-white/18 hover:border-white/60"
                  asChild
                >
                  <Link to={slide.secondaryLink}>{slide.secondaryCta}</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/50 md:left-6 md:h-12 md:w-12"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/50 md:right-6 md:h-12 md:w-12"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

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
