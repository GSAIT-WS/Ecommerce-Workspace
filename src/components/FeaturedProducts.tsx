import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const FeaturedProducts = () => {
  const { data, isLoading, error } = useProducts({ limit: 6 });

  const products = data?.items ?? [];

  return (
    <section className="bg-muted/50 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Best Sellers
          </h2>
          <p className="font-body text-muted-foreground">Our most loved products, straight from the farm</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
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
