import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import heroImage from "@/assets/hero-slide-2.jpg";

const varieties = ["Jowar Peanut", "Sesame Peanut", "Kurmura Peanut"];

const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-border/60 bg-background">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_75%_at_88%_18%,hsl(var(--secondary)/0.16),transparent_60%),radial-gradient(ellipse_55%_60%_at_0%_92%,hsl(var(--primary)/0.08),transparent_58%)]"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute -left-8 top-1/3 hidden h-24 w-24 rounded-full border border-secondary/25 lg:block"
      aria-hidden
    />
    <div className="container relative mx-auto grid items-center gap-10 px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE.smooth }}
        className="max-w-2xl"
      >
        <span className="eyebrow mb-5">Traditional taste. Modern snacking.</span>
        <h1 className="max-w-[11ch] text-balance font-brand text-[2.55rem] font-semibold leading-[1.02] tracking-[-0.035em] text-primary sm:text-[3.4rem] lg:text-[4.4rem]">
          Goodness from the <span className="italic text-brand-green-deep dark:text-secondary">Roots</span>
        </h1>
        <p className="mt-5 max-w-lg font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
          Rooted in India&apos;s food heritage, PURVITA brings traditional chikki flavours to
          today&apos;s generation.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="cta"
            size="xl"
            className="group h-12 rounded-full px-7 text-[15px]"
            asChild
          >
            <Link to="/search">
              Shop Our Chikki
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="group h-12 rounded-full border-primary/25 bg-card/70 px-7 text-[15px] hover:bg-surface-purple/70"
            asChild
          >
            <Link to="/categories">
              Explore Categories
              <Compass className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:rotate-12" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {varieties.map((variety) => (
            <span
              key={variety}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 font-body text-xs font-semibold text-primary shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
              {variety}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.08, ease: EASE.smooth }}
        className="relative mx-auto w-full max-w-[600px] pb-6 sm:pb-0 lg:pb-5"
      >
        <div
          className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.5rem] border border-secondary/20 sm:-inset-4 sm:rounded-[3rem]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-3 -top-5 z-10 hidden rounded-full border border-border/80 bg-card p-3 text-secondary shadow-sm sm:block">
          <Leaf className="h-5 w-5" strokeWidth={1.7} aria-hidden />
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface-cream shadow-[0_30px_70px_-40px_hsl(var(--primary)/0.4)] sm:rounded-[2.5rem]">
          <img
            src={heroImage}
            alt="Sesame chikki bar with visible seeds on a warm cream background"
            className="aspect-[4/3] w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/35 sm:rounded-[2.5rem]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto mt-4 max-w-sm rounded-2xl border border-border/80 bg-card/95 p-4 shadow-card backdrop-blur-sm sm:absolute sm:-bottom-5 sm:left-6 sm:mx-0 sm:mt-0 sm:max-w-[270px]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <Leaf className="h-5 w-5" strokeWidth={1.7} aria-hidden />
            </span>
            <div>
              <p className="font-brand text-base font-semibold leading-tight text-primary">
                Made from traditional grains
              </p>
              <p className="mt-0.5 font-body text-[11px] text-muted-foreground">
                Rooted in India&apos;s food heritage
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
