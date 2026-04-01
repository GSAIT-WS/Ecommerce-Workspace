import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Home,
  Briefcase,
  MapPin,
  MoreVertical,
  Star,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import AddressFormModal from "@/components/address/AddressFormModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import { deleteAddress, setDefaultAddress, type ApiAddress } from "@/services/addressApi";

const labelIcon = (label?: string) => {
  switch (label?.toLowerCase()) {
    case "work":
      return Briefcase;
    case "other":
      return MapPin;
    default:
      return Home;
  }
};

const AddressesPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { addresses, loading, refreshAddresses } = useAddress();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editAddress, setEditAddress] = useState<ApiAddress | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiAddress | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = session?.access_token ?? null;

  const handleSetDefault = async (address: ApiAddress) => {
    if (!token) return;
    setActionLoading(address.id);
    const result = await setDefaultAddress(address.id, token);
    setActionLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Default address updated");
      await refreshAddresses();
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setActionLoading(deleteTarget.id);
    const result = await deleteAddress(deleteTarget.id, token);
    setActionLoading(null);
    setDeleteTarget(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Address deleted");
      await refreshAddresses();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Saved Addresses</h1>
            </div>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Loading skeleton */}
          {loading && addresses.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Address List */}
          {!loading || addresses.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {addresses.map((address) => {
                const Icon = labelIcon(address.label);
                const isDefault = !!address.is_default;
                const isActing = actionLoading === address.id;

                return (
                  <motion.div
                    key={address.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className={`mb-3 rounded-xl border-2 bg-card p-4 shadow-sm transition-colors ${
                      isDefault ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isDefault ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isDefault ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{address.label ?? "Home"}</h3>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              <Star className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {address.recipient_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {[address.address_line1, address.address_line2]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} – {address.postal_code}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            disabled={isActing}
                          >
                            {isActing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditAddress(address)}>
                            Edit
                          </DropdownMenuItem>
                          {!isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(address)}>
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(address)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : null}

          {/* Empty state */}
          {!loading && addresses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-card p-8 text-center shadow-sm"
            >
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No saved addresses yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first delivery address to get started
              </p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Add address modal */}
      <AddressFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        token={token}
        onSuccess={async () => {
          setShowAddModal(false);
          await refreshAddresses();
        }}
      />

      {/* Edit address modal */}
      <AddressFormModal
        open={!!editAddress}
        onClose={() => setEditAddress(null)}
        token={token}
        editAddress={editAddress}
        onSuccess={async () => {
          setEditAddress(null);
          await refreshAddresses();
        }}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <span className="font-medium">{deleteTarget.label}</span>
                  {" — "}
                  {deleteTarget.address_line1}, {deleteTarget.city}
                </>
              )}
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AddressesPage;
