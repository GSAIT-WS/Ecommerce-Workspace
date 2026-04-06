import { Wheat, Dumbbell, Leaf, ShieldCheck } from "lucide-react";

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
    iconWrap: "bg-accent/18 ring-1 ring-accent/30",
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

const TrustSection = () => (
  <section className="relative overflow-hidden border-y border-border/50 bg-gradient-to-b from-surface-subtle/90 via-background to-surface-muted/50 py-12 md:py-16">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,hsl(var(--primary)/0.12),transparent_58%),radial-gradient(ellipse_70%_45%_at_100%_100%,hsl(var(--secondary)/0.08),transparent_55%)]"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 md:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
        <p className="mb-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
          Why choose us
        </p>
        <h2 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Why CRUNCHX?
        </h2>
        <p className="font-body text-[15px] leading-relaxed text-muted-foreground">
          Quality you can trust, nutrition you can taste
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="group flex flex-col items-center rounded-2xl border border-border/60 bg-gradient-to-b from-card to-primary/[0.03] p-7 text-center shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover dark:to-secondary/[0.04]"
          >
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110 ${b.iconWrap}`}
            >
              <b.icon className={`h-7 w-7 ${b.iconClass}`} strokeWidth={1.65} />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-foreground">{b.title}</h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
