import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { savedProducts as initialSaved } from "@/data/user";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const SavedProductsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [saved, setSaved] = useState(initialSaved);

  const handleRemove = (id: string) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
    toast.success("Removed from saved");
  };

  const handleAddToCart = (product: typeof saved[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      tag: "Saved",
      price: product.price,
      image: product.image,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Saved Products</h1>
              <p className="text-sm text-muted-foreground">
                {saved.length} items in your wishlist
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {saved.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {saved.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  className="overflow-hidden rounded-xl bg-card shadow-sm"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-primary">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(product.id)}
                      >
                        <Heart className="h-4 w-4 fill-destructive text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-card p-8 text-center shadow-sm">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No saved products</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start saving products you love
              </p>
              <Button className="mt-4" asChild>
                <Link to="/search">Browse Products</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SavedProductsPage;
