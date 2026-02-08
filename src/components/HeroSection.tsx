import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBanner} alt="Healthy multigrain snacks" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
    </div>
    <div className="container relative mx-auto flex min-h-[520px] items-center px-4 py-20 md:min-h-[600px] md:px-8">
      <div className="max-w-xl animate-fade-in-up">
        <span className="mb-4 inline-block rounded-full bg-secondary/20 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-secondary">
          Farm to Fork · Lambasingi
        </span>
        <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-card md:text-5xl lg:text-6xl">
          Multigrain Nutrition,{" "}
          <span className="text-accent">Naturally Yours</span>
        </h1>
        <p className="mb-8 max-w-md font-body text-base leading-relaxed text-card/80 md:text-lg">
          Premium protein bars, millet snacks & healthy foods ethically sourced from Indian farms. Nourish your body with every crunch.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="rounded-full bg-primary px-8 font-body font-semibold text-primary-foreground shadow-lg hover:bg-primary/90">
            Shop Now
          </Button>
          <Button size="lg" variant="outline" className="rounded-full border-card/30 px-8 font-body font-semibold text-card hover:bg-card/10">
            Explore Categories
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
