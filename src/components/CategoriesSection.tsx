import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Dumbbell, Wheat, Heart, Package } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { EASE, viewportOnce } from "@/lib/motion";

const MotionLink = motion.create(Link);

const categories = [
  {
    name: "Protein Bars",
    icon: Dumbbell,
    slug: "protein-bars",
    surface: "bg-surface-purple/70 dark:bg-surface-purple",
    iconWrap: "bg-primary/10 text-primary ring-1 ring-primary/15",
  },
  {
    name: "Multigrain Snacks",
    icon: Wheat,
    slug: "multigrain",
    surface: "bg-surface-green/80 dark:bg-surface-green",
    iconWrap: "bg-secondary/20 text-primary ring-1 ring-secondary/25",
  },
  {
    name: "Healthy Foods",
    icon: Heart,
    slug: "healthy-foods",
    surface: "bg-surface-yellow/70 dark:bg-surface-yellow",
    iconWrap: "bg-accent/25 text-primary ring-1 ring-accent/30",
  },
  {
    name: "Combos & Value Packs",
    icon: Package,
    slug: "combos",
    surface: "bg-surface-cream/80 dark:bg-surface-cream",
    iconWrap: "bg-primary/10 text-primary ring-1 ring-primary/15",
  },
];

const CategoriesSection = () => (
  <section className="relative overflow-hidden border-y border-border/50 bg-surface-muted/35 py-14 md:py-20">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(var(--primary)/0.055),transparent_62%)]"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 md:px-8">
      <Reveal distance={14} amount={0.2}>
        <div className="section-heading mb-9 md:mb-11">
          <span className="eyebrow eyebrow-centered mb-3">Browse</span>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Find exactly what fuels your lifestyle</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-4 md:gap-5">
        {categories.map((cat, i) => (
          <MotionLink
            key={cat.name}
            to={`/search?category=${cat.slug}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce(0.3)}
            transition={{ delay: i * 0.06, duration: 0.55, ease: EASE.smooth }}
            whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE.smooth } }}
            whileTap={{ scale: 0.99 }}
            className={`card-interactive group relative flex min-h-[10.5rem] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-border/70 p-5 md:min-h-[13.5rem] md:p-6 ${cat.surface}`}
          >
            <span
              className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full border border-primary/10 transition-transform duration-500 ease-smooth group-hover:scale-110"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-4 -right-2 h-14 w-14 rounded-full border border-primary/[0.08]"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 ease-smooth group-hover:-rotate-3 group-hover:scale-105 ${cat.iconWrap}`}
              >
                <cat.icon className="h-6 w-6" strokeWidth={1.65} aria-hidden />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/75 text-primary transition-all duration-300 ease-smooth group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>

            <div className="relative mt-5">
              <span className="block font-brand text-[1.2rem] font-semibold leading-[1.15] tracking-[-0.02em] text-primary md:text-[1.45rem]">
                {cat.name}
              </span>
              <span className="mt-2 flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Explore
                <span
                  className="h-px w-5 bg-secondary/70 transition-all duration-300 ease-smooth group-hover:w-8"
                  aria-hidden
                />
              </span>
            </div>
          </MotionLink>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
