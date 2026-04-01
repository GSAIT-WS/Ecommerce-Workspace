import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Gift, X, ShoppingCart, Percent } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/lib/productsApi";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const TIERS = [
  { min: 2, max: 3, discount: 10 },
  { min: 4, max: 6, discount: 15 },
  { min: 7, max: Infinity, discount: 20 },
];

function getTier(count: number) {
  return TIERS.find((t) => count >= t.min && count <= t.max);
}

const BuildComboPage = () => {
  const { data, isLoading, error } = useProducts({ limit: 100 });
  const allProducts = data?.items ?? [];
  const [selected, setSelected] = useState<Product[]>([]);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const { addToCart } = useCart();

  const toggleProduct = (product: Product) => {
    setSelected((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const removeFromCombo = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const originalTotal = selected.reduce((s, p) => s + p.price, 0);
  const tier = getTier(selected.length);
  const discountPct = tier?.discount || 0;
  const discountAmt = Math.round(originalTotal * (discountPct / 100));
  const finalTotal = originalTotal - discountAmt + (giftWrap ? 29 : 0);

  const handleAddCombo = () => {
    if (selected.length < 2) {
      toast.error("Select at least 2 items for a combo");
      return;
    }
    selected.forEach((p) => {
      addToCart({ id: p.id, name: p.name, tag: p.tag, price: p.price, originalPrice: p.originalPrice, image: p.image });
    });
    toast.success("Combo added to cart ✓");
    setSelected([]);
    setIsGift(false);
    setGiftMessage("");
    setGiftWrap(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
          <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
            Build Your Own CrunchX Combo
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Pick your favorites and unlock combo discounts
          </p>

          {/* Tier info */}
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {TIERS.map((t) => (
              <div
                key={t.min}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  tier?.min === t.min
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.max === Infinity ? `${t.min}+` : `${t.min}–${t.max}`} items → {t.discount}% off
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Product Grid */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : error ? (
                <p className="font-body text-muted-foreground">Unable to load products.</p>
              ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allProducts.map((product) => {
                  const isSelected = selected.some((p) => p.id === product.id);
                  return (
                    <motion.div
                      key={product.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleProduct(product)}
                      className={`cursor-pointer overflow-hidden rounded-xl border-2 bg-card shadow-sm transition-all ${
                        isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/30"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold leading-tight text-foreground line-clamp-2">{product.name}</p>
                        <p className="mt-1 text-sm font-bold text-primary">₹{product.price}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              )}
            </div>

            {/* Combo Box */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">Your Combo</h3>
                  <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {selected.length} items
                  </span>
                </div>

                {selected.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Select products to build your combo</p>
                ) : (
                  <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
                    <AnimatePresence>
                      {selected.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
                        >
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-primary font-semibold">₹{p.price}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFromCombo(p.id); }} className="text-muted-foreground hover:text-destructive">
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Pricing */}
                {selected.length >= 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 space-y-1 border-t border-border pt-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="line-through">₹{originalTotal}</span>
                    </div>
                    <div className="flex justify-between text-secondary font-semibold">
                      <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> {discountPct}% off</span>
                      <span>-₹{discountAmt}</span>
                    </div>
                    {giftWrap && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Gift wrap</span>
                        <span>₹29</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                      <span>Total</span>
                      <span>₹{finalTotal}</span>
                    </div>
                    <p className="text-xs font-semibold text-secondary">You saved ₹{discountAmt}!</p>
                  </motion.div>
                )}

                {/* Gift Option */}
                <div className="mb-4 rounded-lg border border-border p-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox checked={isGift} onCheckedChange={(v) => setIsGift(!!v)} />
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Make this a gift</span>
                  </label>
                  {isGift && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-2">
                      <Input
                        placeholder="Gift message (optional)"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        className="text-sm"
                      />
                      <label className="flex cursor-pointer items-center gap-2">
                        <Checkbox checked={giftWrap} onCheckedChange={(v) => setGiftWrap(!!v)} />
                        <span className="text-xs text-muted-foreground">Add gift wrap (+₹29)</span>
                      </label>
                    </motion.div>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={selected.length < 2}
                  onClick={handleAddCombo}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add Combo to Cart
                </Button>
                {selected.length > 0 && selected.length < 2 && (
                  <p className="mt-2 text-center text-xs text-destructive">Select at least 2 items</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BuildComboPage;
