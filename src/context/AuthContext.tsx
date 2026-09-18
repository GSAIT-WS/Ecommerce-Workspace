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
    // Fallback: force loading to clear after 10 seconds to prevent infinite loading spinner
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const guardSession = async () => {
      // Only activate an existing customer profile after verified auth session.
      try {
        await supabase.rpc("activate_customer_profile");

        const { data: isCustomer, error: guardError } = await supabase.rpc(
          "is_ecommerce_customer"
        );

        if (guardError) {
          console.error("[auth] is_ecommerce_customer check failed:", guardError.message);
          return;
        }

        if (isCustomer === false) {
          await supabase.auth.signOut();
          toast.error(
            "Access denied. This account is inactive or not registered as a CrunchX customer."
          );
        }
      } catch (err) {
        console.error("[auth] guardSession error:", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) {
        void guardSession();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session) {
        void guardSession();
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
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
