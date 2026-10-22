import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import { useLocation } from "react-router-dom";
import AddressFormModal from "./AddressFormModal";

const PROMPT_KEY = "crunchx_address_prompt_shown";

/**
 * One-time-per-session modal shown to logged-in users who have no saved
 * addresses. Shown 800 ms after the context reports addresses are loaded
 * and the list is empty.
 */
const PostLoginAddressPrompt = () => {
  const { user, session } = useAuth();
  const { addresses, loaded, refreshAddresses } = useAddress();
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin-login" || location.pathname.startsWith("/admin-dashboard");

  const [showPrompt, setShowPrompt] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Decide whether to show prompt
  useEffect(() => {
    if (isAdminRoute) return;
    if (!user || !loaded) return;
    if (addresses.length > 0) return;
    if (sessionStorage.getItem(PROMPT_KEY)) return;

    const timer = setTimeout(() => setShowPrompt(true), 800);
    return () => clearTimeout(timer);
  }, [user, loaded, addresses.length, isAdminRoute]);

  const dismiss = () => {
    sessionStorage.setItem(PROMPT_KEY, "1");
    setShowPrompt(false);
    setShowForm(false);
  };

  const handleAddAddress = () => {
    setShowPrompt(false);
    // Small delay so the welcome dialog fully unmounts before the form opens
    setTimeout(() => setShowForm(true), 150);
  };

  const handleFormSuccess = async () => {
    sessionStorage.setItem(PROMPT_KEY, "1");
    setShowForm(false);
    await refreshAddresses();
  };

  if (isAdminRoute) return null;

  return (
    <>
      {/* ── Welcome prompt dialog ── */}
      <AnimatePresence>
        {showPrompt && (
          <Dialog open onOpenChange={(open) => !open && dismiss()}>
            <DialogContent
              className="max-w-sm overflow-hidden p-0"
              aria-describedby="address-prompt-desc"
            >
              {/* Decorative header */}
              <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/20 px-6 pb-6 pt-8 text-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15"
                >
                  <MapPin className="h-8 w-8 text-primary" />
                </motion.div>

                <DialogTitle className="text-lg font-bold text-foreground">
                  Where should we deliver?
                </DialogTitle>
                <p id="address-prompt-desc" className="mt-1 text-sm text-muted-foreground">
                  Add your delivery address for faster checkout and accurate
                  delivery estimates.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 px-6 py-5">
                <Button
                  className="w-full gap-2 rounded-full"
                  onClick={handleAddAddress}
                >
                  <Plus className="h-4 w-4" />
                  Add Delivery Address
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full rounded-full text-muted-foreground hover:text-foreground"
                  onClick={dismiss}
                >
                  Skip for now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── Address form (opens after prompt) ── */}
      <AddressFormModal
        open={showForm}
        onClose={() => { setShowForm(false); sessionStorage.setItem(PROMPT_KEY, "1"); }}
        token={session?.access_token ?? null}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default PostLoginAddressPrompt;
