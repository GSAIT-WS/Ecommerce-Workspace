import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-slide-2.jpg";

const MotionLink = motion.create(Link);

const CombosGiftsBanner = () => (
  <div className="container mx-auto px-4 md:px-8">
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="relative overflow-hidden rounded-[1.75rem] border border-accent/35 bg-surface-yellow/75 shadow-card dark:bg-surface-yellow"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_120%_at_100%_0%,hsl(var(--secondary)/0.18),transparent_58%),radial-gradient(ellipse_50%_100%_at_0%_100%,hsl(var(--primary)/0.08),transparent_60%)]"
        aria-hidden
      />
      <MotionLink
        to="/build-combo"
        className="group relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8"
        whileTap={{ scale: 0.996 }}
      >
        <div className="flex min-w-0 items-center gap-4 md:gap-5">
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg transition-opacity duration-300 group-hover:opacity-80"
              aria-hidden
            />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-card text-primary shadow-sm transition-transform duration-300 ease-smooth group-hover:-rotate-3 group-hover:scale-105">
              <Gift className="h-6 w-6" strokeWidth={1.7} aria-hidden />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
              <h3 className="font-brand text-xl font-semibold tracking-[-0.02em] text-primary md:text-2xl">
                Combos &amp; Gifts
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                <Sparkles className="h-3 w-3" aria-hidden />
                Save up to 20%
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-foreground/70">
              Mix products you love — bundle pricing applies automatically
            </p>
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-4 sm:pl-4">
          <div className="hidden h-16 w-24 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm lg:block">
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <span className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-5 font-body text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm transition-all duration-300 ease-smooth group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            Build Now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
          </span>
        </div>
      </MotionLink>
    </motion.div>
  </div>
);

export default CombosGiftsBanner;
