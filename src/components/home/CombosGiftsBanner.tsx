import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles } from "lucide-react";

const MotionLink = motion.create(Link);

const CombosGiftsBanner = () => (
  <div className="container mx-auto px-4 md:px-8">
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className="relative overflow-hidden rounded-2xl shadow-card"
    >
      <MotionLink
        to="/build-combo"
        className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-primary/25 bg-card/95 p-6 shadow-card ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-[box-shadow,border-color,transform] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-card-elevated-hover dark:border-primary/45 dark:hover:border-primary/60 md:gap-6 md:p-8"
        whileTap={{ scale: 0.995 }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.07] via-secondary/[0.08] to-accent/[0.12] [background-size:200%_100%] animate-gradient-pan"
          aria-hidden
        />
        <motion.span
          className="pointer-events-none absolute -left-10 top-1/2 h-48 w-32 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10"
          aria-hidden
          animate={{ x: ["-20%", "220%"] }}
          transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", repeatDelay: 2 }}
        />
        <motion.span
          className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-primary/25 blur-3xl"
          aria-hidden
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.span
          className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-40 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 6.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="relative flex min-w-0 flex-1 items-center gap-4 md:gap-5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/30 blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />
            <div className="glow-gold relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/16 bg-gradient-to-br from-primary/25 via-primary/15 to-secondary/20 text-primary transition-transform duration-300 ease-smooth group-hover:scale-110 group-hover:border-primary/26 dark:border-primary/34 dark:group-hover:border-primary/46">
              <Gift className="h-7 w-7 drop-shadow-sm" strokeWidth={1.65} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold tracking-[-0.025em] text-foreground md:text-xl">
                Combos &amp; Gifts
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                <Sparkles className="h-3 w-3" aria-hidden />
                Save up to 20%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Mix products you love — bundle pricing applies automatically
            </p>
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-primary/25 bg-primary/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.12em] text-primary transition-all duration-300 ease-smooth group-hover:border-primary/45 group-hover:bg-primary/15 sm:inline-flex">
            Build Now
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-inset ring-white/25 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </MotionLink>
    </motion.div>
  </div>
);

export default CombosGiftsBanner;
