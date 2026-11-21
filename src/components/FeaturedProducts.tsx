import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import Reveal from "@/components/motion/Reveal";

const FeaturedProducts = () => {
  const { data, isLoading, error } = useProducts({ limit: 6 });

  const products = data?.items ?? [];

  return (
    <section className="relative overflow-hidden border-y border-border/50 bg-background py-14 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,hsl(var(--accent)/0.13),transparent_68%)]"
        aria-hidden
      />
      <div className="container relative mx-auto px-4 md:px-8">
        <Reveal distance={14} amount={0.2}>
          <div className="section-heading mb-9 md:mb-12">
            <span className="eyebrow eyebrow-readable eyebrow-centered mb-3">Shop the range</span>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Discover the flavours you&apos;ll love.</p>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:gap-7" aria-label="Loading products">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[1.6rem] border border-border/70 bg-card shadow-card"
              >
                <div className="aspect-[4/4.15] animate-pulse bg-muted/80" />
                <div className="space-y-3 p-4 md:p-5">
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-muted/80" />
                  <div className="h-4 w-2/5 animate-pulse rounded-full bg-muted/80" />
                  <div className="flex gap-2 border-t border-border/60 pt-3">
                    <div className="h-9 flex-1 animate-pulse rounded-full bg-muted/70" />
                    <div className="h-9 flex-1 animate-pulse rounded-full bg-muted/70" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="surface-card mx-auto max-w-xl px-6 py-8 text-center">
            <p className="font-body text-sm text-muted-foreground">
              Unable to load products. Please try again later.
            </p>
          </div>
        ) : products.length > 0 ? (
          <Reveal distance={14} amount={0.1}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:gap-7">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </Reveal>
        ) : (
          <div className="surface-card mx-auto max-w-xl px-6 py-8 text-center">
            <p className="font-body text-sm text-muted-foreground">
              No products yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
