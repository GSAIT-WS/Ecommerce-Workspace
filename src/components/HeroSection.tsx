import { memo, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

const slides = [
  {
    image: heroSlide1,
    badge: "Farm to Fork · Lambasingi",
    title: "Peanut + Millet Bar,",
    highlight: "Naturally Yours",
    description: "Crunchy peanuts meet the goodness of millet in this protein-packed bar. Fuel your day the natural way.",
    cta: "Shop Now",
    ctaLink: "/search",
    secondaryCta: "Explore Categories",
    secondaryLink: "/categories",
  },
  {
    image: heroSlide2,
    badge: "New Arrival",
    title: "Sesame + Millet Bar,",
    highlight: "Toasted Perfection",
    description: "Golden sesame seeds and wholesome millet come together for a light, crunchy, guilt-free snack.",
    cta: "Shop Sesame",
    ctaLink: "/search",
    secondaryCta: "View All",
    secondaryLink: "/categories",
  },
  {
    image: heroSlide3,
    badge: "Best Seller",
    title: "Coconut Millet Bar,",
    highlight: "Tropical Energy",
    description: "Real coconut flakes blended with millet crispies for a naturally sweet, energizing treat.",
    cta: "Shop Coconut",
    ctaLink: "/search",
    secondaryCta: "Explore Categories",
    secondaryLink: "/categories",
  },
  {
    image: heroSlide4,
    badge: "Premium Pick",
    title: "Super Seeds Bar,",
    highlight: "Power Packed",
    description: "Watermelon seeds, pumpkin seeds, flax seeds & dates — a superfood bar crafted for champions.",
    cta: "Shop Seeds",
    ctaLink: "/search",
    secondaryCta: "Categories",
    secondaryLink: "/categories",
  },
];

const HeroSection = memo(() => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setIsPaused(false), 6000);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  useEffect(() => {
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, []);

  const handlePrev = () => { prev(); pauseTemporarily(); };
  const handleNext = () => { next(); pauseTemporarily(); };
  const handleDot = (i: number) => { setCurrent(i); pauseTemporarily(); };

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); setIsPaused(false); }}
    >
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt={s.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-600 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            decoding="async"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      <div className="container relative mx-auto flex min-h-[520px] items-center px-4 py-20 md:min-h-[600px] md:px-8">
        <div className="max-w-xl">
          <span
            key={`badge-${current}`}
            className="mb-4 inline-block animate-fade-in-up rounded-full bg-secondary/20 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-secondary"
          >
            {slide.badge}
          </span>
          <h1
            key={`title-${current}`}
            className="mb-4 animate-fade-in-up font-display text-4xl font-extrabold leading-tight text-card md:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.05s" }}
          >
            {slide.title}{" "}
            <span className="text-accent">{slide.highlight}</span>
          </h1>
          <p
            key={`desc-${current}`}
            className="mb-8 max-w-md animate-fade-in-up font-body text-base leading-relaxed text-card/80 md:text-lg"
            style={{ animationDelay: "0.1s" }}
          >
            {slide.description}
          </p>
          <div
            key={`cta-${current}`}
            className="flex animate-fade-in-up flex-wrap gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            <Button size="lg" className="rounded-full px-8 font-semibold shadow-lg" asChild>
              <Link to={slide.ctaLink}>{slide.cta}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-card/60 bg-card/15 px-8 font-semibold text-card backdrop-blur-sm hover:bg-card/25 hover:border-card/80"
              asChild
            >
              <Link to={slide.secondaryLink}>{slide.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/20 text-card backdrop-blur-sm transition-colors hover:bg-card/40 md:left-6 md:h-12 md:w-12"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/20 text-card backdrop-blur-sm transition-colors hover:bg-card/40 md:right-6 md:h-12 md:w-12"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-card" : "w-2 bg-card/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
