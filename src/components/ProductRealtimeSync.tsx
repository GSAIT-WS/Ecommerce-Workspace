import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { productKeys } from "@/hooks/useProducts";
const ProductRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("products-realtime-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "ecommerce",
          table: "products",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: productKeys.all });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
};

export default ProductRealtimeSync;
