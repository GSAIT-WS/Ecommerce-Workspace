import { Wheat, Dumbbell, Leaf, ShieldCheck } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { staggerContainer, revealTile, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Wheat,
    title: "Multigrain Nutrition",
    desc: "Made with millets, flax, sesame & more ancient grains",
    iconWrap: "bg-surface-purple text-primary ring-1 ring-primary/10 dark:ring-primary/15",
  },
  {
    icon: Dumbbell,
    title: "High Protein",
    desc: "Packed with plant-based protein for an active lifestyle",
    iconWrap: "bg-surface-green text-primary ring-1 ring-secondary/20 dark:ring-secondary/25",
  },
  {
    icon: Leaf,
    title: "Ethically Sourced",
    desc: "Directly from tribal FPOs in Lambasingi, Andhra Pradesh",
    iconWrap: "bg-surface-green text-primary ring-1 ring-secondary/20 dark:ring-secondary/25",
  },
  {
    icon: ShieldCheck,
    title: "No Harmful Preservatives",
    desc: "Clean ingredients, zero chemicals, naturally preserved",
    iconWrap: "bg-surface-yellow text-primary ring-1 ring-accent/25 dark:ring-accent/20",
  },
];

const TrustStat = { value: "12,000+", label: "Happy customers" };

const TrustSection = () => (
  <section className="relative overflow-hidden border-y border-border/50 bg-surface-green/45 py-14 dark:bg-surface-green/55 md:py-20">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,hsl(var(--secondary)/0.14),transparent_62%),radial-gradient(ellipse_55%_45%_at_100%_100%,hsl(var(--accent)/0.08),transparent_58%)]"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 md:px-8">
      <Reveal distance={14} amount={0.2}>
        <div className="section-heading mb-9 md:mb-12">
          <span className="eyebrow eyebrow-centered mb-3">Why choose us</span>
          <h2 className="section-title">Why PURVITA?</h2>
          <p className="section-subtitle">Quality you can trust, nutrition you can taste</p>
        </div>
      </Reveal>

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
            className="card-interactive group relative flex flex-col items-center overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-center shadow-card md:p-7 dark:bg-card/80"
          >
            <span
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"
              aria-hidden
            />
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 ease-smooth group-hover:-rotate-3 group-hover:scale-105 ${b.iconWrap}`}
            >
              <b.icon
                className="h-6 w-6"
                strokeWidth={1.65}
                aria-hidden
              />
            </div>
            <h3 className="mb-2 font-brand text-lg font-semibold leading-tight tracking-[-0.015em] text-primary">
              {b.title}
            </h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <Reveal distance={12} amount={0.2} delay={0.06}>
        <div className="relative mt-8 overflow-hidden rounded-[1.5rem] bg-brand-deep px-6 py-6 text-brand-cream shadow-card md:px-9">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_120%_at_100%_0%,hsl(var(--brand-green)/0.16),transparent_60%),radial-gradient(ellipse_40%_120%_at_0%_100%,hsl(var(--brand-gold)/0.1),transparent_60%)]"
            aria-hidden
          />
          <div className="relative flex flex-col items-center justify-between gap-5 md:flex-row">
            <p className="text-center font-brand text-lg font-medium text-brand-cream md:text-left">
              Trusted by families and athletes across India
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center md:text-left">
                <p className="font-brand text-2xl font-semibold tracking-tight text-brand-gold">
                  {TrustStat.value}
                </p>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-brand-cream/65">
                  {TrustStat.label}
                </p>
              </div>
              <span
                className="h-8 w-px bg-gradient-to-b from-transparent via-brand-cream/25 to-transparent"
                aria-hidden
              />
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2" aria-hidden>
                  {["P", "R", "A"].map((initial) => (
                    <span
                      key={initial}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-deep bg-brand-cream/12 font-body text-[11px] font-bold text-brand-cream"
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-brand-gold text-brand-gold">
                        <path d="M10 1.6l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8L10 1.6z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-body text-[11px] text-brand-cream/65">4.9 average rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default TrustSection;
