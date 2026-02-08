import { Wheat, Dumbbell, Leaf, ShieldCheck } from "lucide-react";

const benefits = [
  { icon: Wheat, title: "Multigrain Nutrition", desc: "Made with millets, flax, sesame & more ancient grains" },
  { icon: Dumbbell, title: "High Protein", desc: "Packed with plant-based protein for an active lifestyle" },
  { icon: Leaf, title: "Ethically Sourced", desc: "Directly from tribal FPOs in Lambasingi, Andhra Pradesh" },
  { icon: ShieldCheck, title: "No Harmful Preservatives", desc: "Clean ingredients, zero chemicals, naturally preserved" },
];

const TrustSection = () => (
  <section className="py-16 md:py-20">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-10 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Why CRUNCHX?
        </h2>
        <p className="font-body text-muted-foreground">Quality you can trust, nutrition you can taste</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.title} className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
              <b.icon className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-foreground">{b.title}</h3>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
