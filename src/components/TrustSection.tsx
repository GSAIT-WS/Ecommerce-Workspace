import { Wheat, Dumbbell, Leaf, ShieldCheck } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { staggerContainer, revealTile, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Wheat,
    title: "Multigrain Nutrition",
    desc: "Made with millets, flax, sesame & more ancient grains",
    iconWrap: "bg-primary/14 ring-1 ring-primary/20",
    iconClass: "text-primary",
  },
  {
    icon: Dumbbell,
    title: "High Protein",
    desc: "Packed with plant-based protein for an active lifestyle",
    iconWrap: "bg-secondary/14 ring-1 ring-secondary/25",
    iconClass: "text-secondary",
  },
  {
    icon: Leaf,
    title: "Ethically Sourced",
    desc: "Directly from tribal FPOs in Lambasingi, Andhra Pradesh",
    iconWrap: "bg-[hsl(84_24%_63%_/_0.22)] ring-1 ring-secondary/25",
    iconClass: "text-secondary",
  },
  {
    icon: ShieldCheck,
    title: "No Harmful Preservatives",
    desc: "Clean ingredients, zero chemicals, naturally preserved",
    iconWrap: "bg-muted ring-1 ring-border/80",
    iconClass: "text-primary",
  },
];

const TrustStat = { value: "12,000+", label: "Happy customers" };

const TrustSection = () => (
  <section className="relative overflow-hidden border-y border-border/50 bg-gradient-to-b from-surface-subtle/90 via-background to-surface-muted/50 py-14 md:py-20">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,hsl(var(--primary)/0.14),transparent_58%),radial-gradient(ellipse_70%_45%_at_100%_100%,hsl(var(--secondary)/0.09),transparent_55%)]"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 md:px-8">
      <Reveal distance={14} amount={0.2}>
        <div className="section-heading mb-9 md:mb-12">
          <span className="eyebrow eyebrow-centered mb-3">Why choose us</span>
          <h2 className="section-title">
            Why <span className="text-gradient">PURVITA?</span>
          </h2>
          <p className="section-subtitle">Quality you can trust, nutrition you can taste</p>
        </div>
      </Reveal>

      {/* Tiles are the grid items themselves — motion.div in place, no wrapper,
          so equal-height stretching across a row is unchanged. */}
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce(0.15)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5"
      >
        {benefits.map((b) => (
          <motion.div
            key={b.title}
            variants={revealTile}
            className="card-interactive group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-primary/[0.03] p-7 text-center shadow-card dark:to-secondary/[0.04]"
          >
            {/* Radial gold bloom revealed on hover */}
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.14),transparent_62%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden
            />
            <div
              className={`icon-tile mb-4 h-14 w-14 rounded-full group-hover:scale-110 ${b.iconWrap}`}
            >
              <b.icon
                className={`h-7 w-7 transition-transform duration-500 ease-smooth group-hover:scale-110 ${b.iconClass}`}
                strokeWidth={1.65}
              />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold tracking-[-0.02em] text-foreground transition-colors duration-300 group-hover:text-primary">
              {b.title}
            </h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Social proof bar — rounded, glassy strip tying the four pillars together */}
      <Reveal distance={12} amount={0.2} delay={0.06}>
        <div className="surface-card mt-8 flex flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row md:px-10">
          <p className="font-body text-[15px] text-muted-foreground">
            Trusted by families and athletes across India
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold tracking-tight text-primary text-glow-gold">
                {TrustStat.value}
              </p>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {TrustStat.label}
              </p>
            </div>
            <span className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden />
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2" aria-hidden>
                {["P", "R", "A"].map((initial) => (
                  <span
                    key={initial}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br from-primary/25 to-secondary/25 font-display text-[11px] font-bold text-primary"
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-primary text-primary">
                      <path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8L10 1.6z" />
                    </svg>
                  ))}
                </div>
                <p className="font-body text-[11px] text-muted-foreground">4.9 average rating</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default TrustSection;
