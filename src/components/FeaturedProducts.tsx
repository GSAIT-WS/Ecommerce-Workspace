import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const FeaturedProducts = () => {
  const { data, isLoading, error } = useProducts({ limit: 6 });

  const products = data?.items ?? [];

  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-surface-subtle/50 py-14 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--accent)/0.09),transparent_60%)]"
        aria-hidden
      />
      <div className="container relative mx-auto px-4 md:px-8">
        <div className="section-heading mb-9 md:mb-12">
          <span className="eyebrow eyebrow-centered mb-3">Loved by thousands</span>
          <h2 className="section-title">Best <span className="text-gradient">Sellers</span></h2>
          <p className="section-subtitle">
            Our most loved products, straight from the farm
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted/70" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center font-body text-muted-foreground">Unable to load products. Please try again later.</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className="text-center font-body text-muted-foreground">No products yet. Check back soon!</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
