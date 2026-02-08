import ProductCard from "./ProductCard";
import { allProducts } from "@/data/products";

// Get first 6 products for featured section
const products = allProducts.slice(0, 6);

const FeaturedProducts = () => (
  <section className="bg-muted/50 py-16 md:py-20">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-10 text-center">
        <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Best Sellers
        </h2>
        <p className="font-body text-muted-foreground">Our most loved products, straight from the farm</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProducts;
