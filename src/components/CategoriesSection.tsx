import { Dumbbell, Wheat, Heart, Package } from "lucide-react";

const categories = [
  { name: "Protein Bars", icon: Dumbbell, color: "bg-primary/10 text-primary" },
  { name: "Multigrain Snacks", icon: Wheat, color: "bg-secondary/10 text-secondary" },
  { name: "Healthy Foods", icon: Heart, color: "bg-accent/30 text-accent-foreground" },
  { name: "Combos & Value Packs", icon: Package, color: "bg-muted text-muted-foreground" },
];

const CategoriesSection = () => (
  <section className="py-16 md:py-20">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-10 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Shop by Category
        </h2>
        <p className="font-body text-muted-foreground">Find exactly what fuels your lifestyle</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:p-8"
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cat.color} transition-transform group-hover:scale-110`}>
              <cat.icon className="h-7 w-7" />
            </div>
            <span className="font-body text-sm font-semibold text-foreground md:text-base">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
