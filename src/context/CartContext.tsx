import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { hasApiConfig } from "@/lib/api";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/productImagePlaceholder";
import {
  addToCartApi,
  getCartApi,
  removeCartItemApi,
  updateCartItemApi,
  type ServerCartLine,
} from "@/services/cartApi";
import { clearServerCart } from "@/services/checkoutApi";
import { useAuth } from "@/context/AuthContext";
import { FREE_SHIPPING_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/shipping";

const CART_STORAGE_KEY = "crunchx_cart";
const PENDING_MERGE_KEY = "crunchx_pending_cart_merge";

export interface CartItem {
  id: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  /** Server cart line id (combo rows, or when id is the line id) */
  serverCartItemId?: string;
  /** When this line is a server combo, replayed at checkout after clear-cart */
  comboCustomization?: {
    items: { product_id: string; quantity: number }[];
    gift_wrap?: boolean;
    gift_message?: string;
  };
}

function firstTag(tags: unknown): string {
  if (Array.isArray(tags) && tags.length > 0 && typeof tags[0] === "string") {
    return tags[0];
  }
  return "";
}

function mapServerLinesToCartItems(lines: ServerCartLine[]): CartItem[] {
  const out: CartItem[] = [];
  for (const row of lines) {
    const qty = Number(row.quantity) || 0;
    if (qty < 1) continue;

    if (row.item_type === "combo" && row.combo) {
      const c = row.combo;
      const unit = row.unit_price != null ? Number(row.unit_price) : Number(c.combo_price);
      const custom = row.customization_json ?? undefined;
      out.push({
        id: String(row.id),
        serverCartItemId: String(row.id),
        name: String(c.name),
        tag: "Combo",
        price: unit,
        image: c.image_url || PRODUCT_IMAGE_PLACEHOLDER,
        quantity: qty,
        ...(custom?.items?.length ? { comboCustomization: custom } : {}),
      });
      continue;
    }

    const p = row.product;
    if (!p) continue;
    out.push({
      id: String(p.id),
      name: String(p.name),
      tag: firstTag(p.tags),
      price: Number(p.price),
      originalPrice: p.compare_at_price != null ? Number(p.compare_at_price) : undefined,
      image: p.image_url || PRODUCT_IMAGE_PLACEHOLDER,
      quantity: qty,
    });
  }
  return out;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getCartTotal: () => number;
  getSubtotal: () => number;
  getDeliveryCharge: () => number;
  getSavings: () => number;
  clearCart: () => void;
  /** True while the first server cart fetch after login is in progress */
  cartHydrating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading: authLoading } = useAuth();
  const token = session?.access_token ?? null;
  const userId = session?.user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [cartHydrating, setCartHydrating] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        sessionStorage.setItem(PENDING_MERGE_KEY, "1");
      }
      if (event === "SIGNED_OUT") {
        sessionStorage.removeItem(PENDING_MERGE_KEY);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading || token) return;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      setItems(stored ? JSON.parse(stored) : []);
    } catch {
      setItems([]);
    }
  }, [authLoading, token]);

  useEffect(() => {
    if (!token || !userId || authLoading || !hasApiConfig()) return;

    let cancelled = false;
    setCartHydrating(true);

    (async () => {
      try {
        const needMerge = sessionStorage.getItem(PENDING_MERGE_KEY) === "1";
        if (needMerge) {
          sessionStorage.removeItem(PENDING_MERGE_KEY);
          const snapshot = [...itemsRef.current];
          for (const it of snapshot) {
            if (it.serverCartItemId) continue;
            const r = await addToCartApi(
              { product_id: it.id, quantity: it.quantity, item_type: "product" },
              token,
            );
            if (r.error) {
              toast.error(r.error);
              break;
            }
          }
        }

        const r = await getCartApi(token);
        if (cancelled) return;
        if (r.error) {
          toast.error(r.error);
        } else if (r.items) {
          setItems(mapServerLinesToCartItems(r.items));
        }
      } finally {
        if (!cancelled) setCartHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, token, userId]);

  useEffect(() => {
    if (token) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, token]);

  const refreshServerCart = useCallback(async () => {
    if (!token || !hasApiConfig()) return;
    const r = await getCartApi(token);
    if (r.error) {
      toast.error(r.error);
      return;
    }
    if (r.items) setItems(mapServerLinesToCartItems(r.items));
  }, [token]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prevItems) => {
        const match = (i: CartItem) =>
          i.id === item.id && i.serverCartItemId === item.serverCartItemId;
        const existingItem = prevItems.find(match);
        if (existingItem) {
          return prevItems.map((i) =>
            match(i) ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prevItems, { ...item, quantity }];
      });

      if (!token || !hasApiConfig()) return;

      void (async () => {
        const r = await addToCartApi(
          { product_id: item.id, quantity, item_type: "product" },
          token,
        );
        if (r.error) {
          toast.error(r.error);
          await refreshServerCart();
          return;
        }
        await refreshServerCart();
      })();
    },
    [token, refreshServerCart],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      const target = itemsRef.current.find((i) => i.id === id);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));

      if (!token || !hasApiConfig() || !target) return;

      void (async () => {
        const r = target.serverCartItemId
          ? await removeCartItemApi({ cart_item_id: target.serverCartItemId }, token)
          : await removeCartItemApi({ product_id: id }, token);
        if (r.error) {
          toast.error(r.error);
          await refreshServerCart();
          return;
        }
        await refreshServerCart();
      })();
    },
    [token, refreshServerCart],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      const target = itemsRef.current.find((i) => i.id === id);
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );

      if (!token || !hasApiConfig() || !target) return;

      void (async () => {
        const body = target.serverCartItemId
          ? { cart_item_id: target.serverCartItemId, quantity }
          : { product_id: id, quantity };
        const r = await updateCartItemApi(body, token);
        if (r.error) {
          toast.error(r.error);
          await refreshServerCart();
          return;
        }
        await refreshServerCart();
      })();
    },
    [token, refreshServerCart, removeFromCart],
  );

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getDeliveryCharge = useCallback(() => {
    const subtotal = getSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  }, [getSubtotal]);

  const getSavings = useCallback(() => {
    return items.reduce(
      (sum, item) => sum + ((item.originalPrice || 0) - item.price) * item.quantity,
      0,
    );
  }, [items]);

  const getCartTotal = useCallback(() => {
    return getSubtotal() + getDeliveryCharge();
  }, [getSubtotal, getDeliveryCharge]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (!token || !hasApiConfig()) return;
    void (async () => {
      const r = await clearServerCart(token);
      if (r.error) toast.error(r.error);
    })();
  }, [token]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getSubtotal,
        getDeliveryCharge,
        getSavings,
        clearCart,
        cartHydrating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
