import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ratedProducts } from "@/data/user";
import { formatProductName } from "@/lib/productName";

const RatingsPage = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-bold">Ratings & Reviews</h1>
              <p className="text-sm text-muted-foreground">
                {ratedProducts.length} products rated
              </p>
            </div>
          </div>

          {/* Ratings List */}
          <div className="space-y-4">
            {ratedProducts.map((product) => (
              <motion.div
                key={product.id}
                className="overflow-hidden rounded-xl bg-card shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  <Link to={`/product/${product.id}`}>
                    <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={product.image}
                        alt={formatProductName(product.name)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold hover:text-primary">
                        {formatProductName(product.name)}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < product.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-muted-foreground">
                        {product.date}
                      </span>
                    </div>
                    {product.review && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        "{product.review}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {ratedProducts.length === 0 && (
            <div className="rounded-xl bg-card p-8 text-center shadow-sm">
              <Star className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No ratings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Rate products after you receive them
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default RatingsPage;
