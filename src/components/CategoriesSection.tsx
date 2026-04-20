import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Wheat, Heart, Package } from "lucide-react";

const MotionLink = motion.create(Link);

/** Icon tiles use only theme tokens (primary / secondary / accent / muted) — no extra hue families. */
const categories = [
  {
    name: "Protein Bars",
    icon: Dumbbell,
    slug: "protein-bars",
    mesh: "from-primary/20 via-primary/8 to-muted",
    iconClass: "text-primary",
    blob: "bg-primary/15",
  },
  {
    name: "Multigrain Snacks",
    icon: Wheat,
    slug: "multigrain",
    mesh: "from-secondary/18 via-secondary/7 to-muted",
    iconClass: "text-secondary",
    blob: "bg-secondary/12",
  },
  {
    name: "Healthy Foods",
    icon: Heart,
    slug: "healthy-foods",
    mesh: "from-accent/22 via-accent/9 to-muted",
    iconClass: "text-accent",
    blob: "bg-accent/14",
  },
  {
    name: "Combos & Value Packs",
    icon: Package,
    slug: "combos",
    mesh: "from-primary/12 via-secondary/10 to-accent/14",
    iconClass: "text-primary",
    blob: "bg-primary/10",
  },
];

const CategoriesSection = () => (
  <section className="bg-surface-muted/40 py-12 md:py-16">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Shop by Category
        </h2>
        <p className="font-body text-[15px] leading-relaxed text-muted-foreground">
          Find exactly what fuels your lifestyle
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
        {categories.map((cat, i) => (
          <MotionLink
            key={cat.name}
            to={`/search?category=${cat.slug}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              scale: 1.02,
              y: -4,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 shadow-card ring-1 ring-black/[0.04] transition-[box-shadow,border-color,transform] duration-300 ease-in-out hover:border-primary/30 hover:shadow-card-hover dark:from-card dark:via-card dark:to-secondary/[0.06] dark:ring-white/[0.06] md:gap-4 md:p-8"
          >
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${cat.blob} blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:opacity-90`}
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-4">
              <motion.div
                className="relative"
                whileHover={{ rotate: [0, -5, 5, -2, 0] }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              >
                <div
                  className={`absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br ${cat.mesh} opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-80`}
                  aria-hidden
                />
                <div
                  className={`relative flex h-[4.25rem] w-[4.25rem] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${cat.mesh} shadow-sm ring-1 ring-border/60 transition-shadow duration-300 group-hover:shadow-md group-hover:ring-border/90 dark:ring-1 dark:ring-primary/35 dark:shadow-[0_1px_0_0_hsl(var(--primary)/0.12)] dark:group-hover:ring-primary/50 dark:group-hover:shadow-md`}
                >
                  <div
                    className="absolute inset-0 rounded-2xl bg-card/40 backdrop-blur-[1px] transition-opacity duration-300 dark:bg-card/25 group-hover:opacity-90"
                    aria-hidden
                  />
                  {/* Edge vignette on hover: borders go dull, center stays clear for the icon */}
                  <div
                    className="pointer-events-none absolute inset-0 z-[2] rounded-2xl opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_50%,transparent_32%,hsl(var(--muted)/0.45)_65%,hsl(var(--muted)/0.82)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,transparent_30%,hsl(var(--foreground)/0.06)_58%,hsl(var(--foreground)/0.18)_100%)]"
                    aria-hidden
                  />
                  <cat.icon
                    className={`relative z-[3] h-8 w-8 opacity-90 transition-all duration-300 ease-out group-hover:scale-[1.12] group-hover:opacity-100 group-hover:brightness-110 group-hover:drop-shadow-[0_2px_14px_hsl(var(--primary)/0.35)] dark:group-hover:drop-shadow-[0_2px_18px_hsl(var(--primary)/0.45)] ${cat.iconClass}`}
                    strokeWidth={1.65}
                  />
                </div>
              </motion.div>
              <span className="relative text-center font-body text-sm font-semibold text-foreground md:text-base">
                {cat.name}
              </span>
            </div>
          </MotionLink>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
