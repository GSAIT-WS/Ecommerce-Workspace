import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import AddressFormModal from "./AddressFormModal";

/**
 * Non-blocking banner shown on the home page after login when the user
 * has no saved addresses. Dismissed permanently for the session on skip.
 */
const NoAddressBanner = () => {
  const { user, session } = useAuth();
  const { addresses, loaded, refreshAddresses } = useAddress();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Only show when: logged in, addresses loaded, zero addresses, not dismissed
  if (!user || !loaded || addresses.length > 0 || dismissed) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mb-4 mt-0 md:mx-8"
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Add your delivery address
                </p>
                <p className="text-xs text-muted-foreground">
                  Save your address for faster checkout
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setShowModal(true)}
              >
                Add Address
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AddressFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        token={session?.access_token ?? null}
        onSuccess={async () => {
          await refreshAddresses();
          setShowModal(false);
          setDismissed(true);
        }}
      />
    </>
  );
};

export default NoAddressBanner;
