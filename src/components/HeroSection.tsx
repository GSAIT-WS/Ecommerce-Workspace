import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import bannerRange from "@/assets/product_images/product_banner_1.jpeg";
import bannerJowar from "@/assets/product_images/banner_jowar_chikki.jpeg";
import bannerKurumura from "@/assets/product_images/banner_krumura_chikki.jpeg";
import bannerSesame from "@/assets/product_images/banner_seseme_chikki_img.jpeg";

const AUTOPLAY_MS = 5000;

const heroSlides = [
  {
    id: "range",
    image: bannerRange,
    alt: "PURVITA jowar, kurumura and sesame peanut chikki packs on a blue background",
    eyebrow: "The PURVITA range",
    titleLead: "Goodness from the",
    titleAccent: "Roots",
    description:
      "Traditional chikki flavours, reimagined for everyday snacking.",
    ctaLabel: "Shop Our Chikki",
    imagePosition: "55% center",
  },
  {
    id: "jowar",
    image: bannerJowar,
    alt: "PURVITA jowar peanut chikki pack on a pink and purple background",
    eyebrow: "Traditional chikki",
    titleLead: "Jowar Peanut",
    titleAccent: "Chikki",
    description: "A familiar grain paired with peanuts in a traditional chikki.",
    ctaLabel: "Shop All Chikki",
    imagePosition: "68% center",
  },
  {
    id: "kurumura",
    image: bannerKurumura,
    alt: "PURVITA kurumura peanut chikki pack on a blue and purple background",
    eyebrow: "Traditional chikki",
    titleLead: "Kurumura Peanut",
    titleAccent: "Chikki",
    description: "A crisp chikki with peanuts in every bite.",
    ctaLabel: "Shop All Chikki",
    imagePosition: "68% center",
  },
  {
    id: "sesame",
    image: bannerSesame,
    alt: "PURVITA sesame peanut chikki pack on a yellow and purple background",
    eyebrow: "Traditional chikki",
    titleLead: "Sesame Peanut",
    titleAccent: "Chikki",
    description: "Sesame and peanuts in a traditional chikki.",
    ctaLabel: "Shop All Chikki",
    imagePosition: "55% center",
  },
] as const;

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const slide = heroSlides[current];

  useEffect(() => {
    const syncVisibility = () => setIsPageHidden(document.visibilityState === "hidden");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      isUserPaused ||
      isHovered ||
      isFocused ||
      isPageHidden
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCurrent((index) => (index + 1) % heroSlides.length);
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timeout);
  }, [
    current,
    isFocused,
    isHovered,
    isPageHidden,
    isUserPaused,
    prefersReducedMotion,
  ]);

  const goToSlide = (index: number) => setCurrent(index);

  const togglePlayback = () => {
    if (isUserPaused) {
      setIsUserPaused(false);
      setIsFocused(false);
    } else {
      setIsUserPaused(true);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border/60 bg-brand-deep"
      aria-roledescription="carousel"
      aria-label="PURVITA featured chikki"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="relative h-[520px] w-full sm:h-[540px] md:h-[clamp(460px,38vw,620px)]">
        {heroSlides.map((item, index) => (
          <motion.img
            key={item.id}
            src={item.image}
            alt={index === current ? item.alt : ""}
            aria-hidden={index !== current}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            style={{ objectPosition: item.imagePosition }}
            initial={false}
            animate={{ opacity: index === current ? 1 : 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.8,
              ease: EASE.smooth,
            }}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 bg-banner-scrim" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-hero-depth" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent md:from-black/15"
          aria-hidden
        />

        <div className="container relative z-10 mx-auto flex h-full items-end px-4 pb-7 sm:px-6 sm:pb-9 md:px-8 lg:items-center lg:pb-0">
          <div className="flex w-full max-w-[34rem] flex-col items-start">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: EASE.smooth,
                }}
                className="w-full"
              >
                <p className="eyebrow eyebrow-inverse mb-4 text-white/85 sm:mb-5">
                  {slide.eyebrow}
                </p>
                <h1 className="max-w-[13ch] text-balance font-brand text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.035em] text-white drop-shadow-[0_2px_22px_rgba(0,0,0,0.36)] sm:text-[3.15rem] lg:text-[3.65rem] xl:text-[4rem]">
                  {slide.titleLead}{" "}
                  <span className="italic text-brand-gold">{slide.titleAccent}</span>
                </h1>
                <p className="mt-3 max-w-[29rem] font-body text-[15px] leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)] sm:mt-4 sm:text-base lg:text-[17px]">
                  {slide.description}
                </p>

                <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-center">
                  <Button
                    variant="cta"
                    size="xl"
                    className="group h-11 w-full rounded-full px-6 text-sm shadow-lg sm:h-12 sm:w-auto sm:px-7 sm:text-[15px]"
                    asChild
                  >
                    <Link to="/search">
                      {slide.ctaLabel}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="group h-11 w-full rounded-full border-white/35 bg-white/10 px-6 text-sm text-white shadow-sm backdrop-blur-sm hover:border-white/50 hover:bg-white/20 hover:text-white sm:h-12 sm:w-auto sm:px-7 sm:text-[15px]"
                    asChild
                  >
                    <Link to="/categories">
                      Explore Categories
                      <Compass className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:rotate-12" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-2.5 sm:mt-7">
              <div className="flex items-center" role="group" aria-label="Choose a banner">
                {heroSlides.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className="group flex h-8 min-w-6 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
                    aria-label={`Show banner ${index + 1}: ${item.titleLead} ${item.titleAccent}`}
                    aria-current={index === current ? "true" : undefined}
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ease-smooth ${
                        index === current
                          ? "w-8 bg-brand-gold shadow-sm shadow-black/20"
                          : "w-1.5 bg-white/50 group-hover:bg-white/80"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {!prefersReducedMotion && (
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white/80 backdrop-blur-sm transition-colors duration-300 hover:border-white/40 hover:bg-black/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
                  aria-label={isUserPaused ? "Play banner slideshow" : "Pause banner slideshow"}
                  title={isUserPaused ? "Play banner slideshow" : "Pause banner slideshow"}
                >
                  {isUserPaused ? (
                    <Play className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Pause className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
