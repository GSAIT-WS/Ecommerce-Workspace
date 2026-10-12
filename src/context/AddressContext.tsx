import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getMyAddresses,
  loadGuestAddresses,
  type ApiAddress,
} from "@/services/addressApi";

interface AddressContextValue {
  addresses: ApiAddress[];
  loading: boolean;
  /** true once the first load has completed (API or localStorage) */
  loaded: boolean;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  refreshAddresses: () => Promise<void>;
}

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { session, user } = useAuth();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  /** Auto-selects the best address from a list (default first, else first) */
  const autoSelect = useCallback((addrs: ApiAddress[]) => {
    setSelectedAddressId((prev) => {
      if (prev && addrs.some((a) => a.id === prev)) return prev;
      const def = addrs.find((a) => a.is_default) ?? addrs[0];
      return def?.id ?? null;
    });
  }, []);

  const refreshAddresses = useCallback(async () => {
    const token = session?.access_token;

    if (token) {
      // ── Authenticated: load from Supabase ─────────────────────────────────
      setLoading(true);
      try {
        const { addresses: fetched } = await getMyAddresses(token);
        const apiAddrs = fetched ?? [];

        // Merge any locally-saved fallback addresses (saved when API was down)
        // so they remain visible until the backend syncs them.
        const localFallbacks = loadGuestAddresses().filter((a) =>
          a.id.startsWith("local-")
        );
        const merged = [
          ...apiAddrs,
          // Only include fallbacks whose id isn't already in the API result
          ...localFallbacks.filter((lf) => !apiAddrs.some((a) => a.id === lf.id)),
        ];

        setAddresses(merged);
        autoSelect(merged);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    } else {
      // ── Guest: load from localStorage ─────────────────────────────────────
      console.log("[PURVITA] AddressContext: loading guest addresses from localStorage");
      const guestAddrs = loadGuestAddresses();
      setAddresses(guestAddrs);
      autoSelect(guestAddrs);
      setLoaded(true);
    }
  }, [session?.access_token, autoSelect]);

  // Re-load whenever auth state changes
  useEffect(() => {
    refreshAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, session?.access_token]);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        loaded,
        selectedAddressId,
        setSelectedAddressId,
        refreshAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddress must be used inside <AddressProvider>");
  return ctx;
}
