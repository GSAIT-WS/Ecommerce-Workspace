import ProductCard from "./ProductCard";
import productProteinBar from "@/assets/product-protein-bar.jpg";
import productMultigrain from "@/assets/product-multigrain-snack.jpg";
import productChikki from "@/assets/product-chikki.jpg";
import productMillet from "@/assets/product-millet-bar.jpg";
import productHealthyMix from "@/assets/product-healthy-mix.jpg";
import productShilajit from "@/assets/product-shilajit-bar.jpg";

const products = [
  { name: "Millet & Flax Energy Bar", tag: "Multigrain", price: 99, originalPrice: 129, rating: 4.5, image: productMillet },
  { name: "Himalayan Shilajit Power Bar", tag: "High Protein", price: 149, originalPrice: 199, rating: 4.8, image: productShilajit },
  { name: "Peanut Chikki Classic", tag: "Bestseller", price: 49, rating: 4.7, image: productChikki },
  { name: "Multigrain Crunch Chips", tag: "Healthy", price: 79, originalPrice: 99, rating: 4.3, image: productMultigrain },
  { name: "Protein Nut Bar", tag: "High Protein", price: 119, rating: 4.6, image: productProteinBar },
  { name: "Trail Mix — Nuts & Berries", tag: "Healthy", price: 199, originalPrice: 249, rating: 4.4, image: productHealthyMix },
];

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
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProducts;
