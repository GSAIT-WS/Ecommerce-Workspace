import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import AddressFormModal from "./AddressFormModal";

interface Props {
  /** When true renders a compact version suited for tight spaces */
  compact?: boolean;
  onInteract?: () => void;
}

/**
 * Blinkit-style delivery location chip.
 * - No addresses → "Add address" (opens form modal)
 * - Has addresses → shows city of selected address (navigates to /profile/addresses)
 */
const DeliveryLocationChip = ({ compact = false, onInteract }: Props) => {
  const { user, session } = useAuth();
  const { addresses, selectedAddressId, refreshAddresses } = useAddress();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.is_default) ??
    addresses[0];

  const hasAddress = !!selectedAddress;
  const label = hasAddress
    ? selectedAddress.city
    : "Add address";
  const sublabel = hasAddress
    ? (selectedAddress.label ?? "Home")
    : "Set location";

  const handleClick = () => {
    onInteract?.();
    if (hasAddress) {
      navigate("/profile/addresses");
    } else {
      setShowForm(true);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    await refreshAddresses();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`group flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 transition-all hover:border-primary/40 hover:bg-primary/5 ${
          compact ? "py-1" : "py-1.5"
        }`}
      >
        <MapPin
          className={`shrink-0 text-primary transition-transform group-hover:scale-110 ${
            compact ? "h-3.5 w-3.5" : "h-4 w-4"
          }`}
        />

        <span className="flex flex-col items-start leading-none">
          {!compact && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {hasAddress ? sublabel : "Deliver to"}
            </span>
          )}
          <span
            className={`font-semibold text-foreground ${
              compact ? "text-xs" : "max-w-[100px] truncate text-sm"
            }`}
          >
            {label}
          </span>
        </span>

        <ChevronDown
          className={`shrink-0 text-muted-foreground transition-transform group-hover:text-primary ${
            compact ? "h-3 w-3" : "h-3.5 w-3.5"
          }`}
        />
      </button>

      <AddressFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        token={session?.access_token ?? null}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default DeliveryLocationChip;
