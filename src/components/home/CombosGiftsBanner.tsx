import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles } from "lucide-react";

const MotionLink = motion.create(Link);

const CombosGiftsBanner = () => (
  <div className="container mx-auto px-4 md:px-8">
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className="relative overflow-hidden rounded-2xl p-[2px] shadow-card ring-1 ring-border/30"
    >
      <div className="absolute inset-0 opacity-95" aria-hidden>
        <div
          className="absolute inset-[-120%] animate-combo-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--primary))_0deg,hsl(var(--secondary))_120deg,hsl(var(--accent))_240deg,hsl(var(--primary))_360deg)]"
        />
      </div>
      <MotionLink
        to="/build-combo"
        className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-[0.9rem] border border-border/50 bg-card/95 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-primary/10 md:gap-6 md:p-8"
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
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-primary/15 to-secondary/20 text-primary shadow-inner ring-2 ring-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:ring-primary/35">
              <Gift className="h-7 w-7 drop-shadow-sm" strokeWidth={1.65} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold text-foreground md:text-xl">
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
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ArrowRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover:translate-x-1" />
          </motion.div>
        </div>
      </MotionLink>
    </motion.div>
  </div>
);

export default CombosGiftsBanner;
