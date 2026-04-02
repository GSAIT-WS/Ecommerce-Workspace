import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session) {
        void (async () => {
          // Step 1 — ensure a customer_profiles row exists for new customers.
          // IMS staff are silently skipped by the function itself.
          await supabase.rpc("ensure_customer_profile").catch(() => {});

          // Step 2 — verify this is a legitimate ecommerce customer.
          // Returns false for IMS staff and any account with no customer_profiles row.
          const { data: isCustomer, error: guardError } = await supabase.rpc(
            "is_ecommerce_customer"
          );

          if (guardError) {
            // Network / DB error — do not lock out the user, but log it.
            console.error("[auth] is_ecommerce_customer check failed:", guardError.message);
            return;
          }

          if (isCustomer === false) {
            // Not an ecommerce customer (IMS staff or no profile).
            // Sign out immediately to prevent unauthorised access.
            await supabase.auth.signOut();
            toast.error(
              "Access denied. This account is not registered as a CrunchX customer. Please use the IMS portal."
            );
          }
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
