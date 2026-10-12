import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Package,
  RefreshCw,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  Info,
  LogOut,
  Trash2,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Home,
  Briefcase,
  Plus,
} from "lucide-react";
import { Moon, Sun } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileMenuItem from "@/components/profile/ProfileMenuItem";
import ProfileSection from "@/components/profile/ProfileSection";
import AddressFormModal from "@/components/address/AddressFormModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  healthPreferences,
  notificationSettings,
} from "@/data/user";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { apiCall } from "@/lib/api";

const addressLabelIcon = (label?: string) => {
  switch (label?.toLowerCase()) {
    case "work": return Briefcase;
    case "other": return MapPin;
    default: return Home;
  }
};

const ProfilePage = () => {
  const [notifications, setNotifications] = useState(notificationSettings);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileName, setProfileName] = useState<string>("");
  const updatedFullName =
    ((location.state as { updatedFullName?: string } | null)?.updatedFullName ?? "").trim();

  useEffect(() => {
    if (updatedFullName) {
      setProfileName(updatedFullName);
    }
  }, [updatedFullName]);

  useEffect(() => {
    if (!user) return;

    const loadProfileName = async () => {
      const { data, error } = await supabase.rpc("get_my_profile");
      if (error) {
        console.error("[profile] get_my_profile failed:", error.message);
        return;
      }
      const row = Array.isArray(data) ? data[0] : null;
      const name = typeof row?.full_name === "string" ? row.full_name.trim() : "";
      if (updatedFullName && name !== updatedFullName) {
        return;
      }
      setProfileName(name);
    };
    void loadProfileName();
  }, [user, updatedFullName]);

  const metaName = (user?.user_metadata?.full_name as string | undefined)?.trim() ?? "";
  const displayName = updatedFullName || profileName || metaName || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email ?? "";
  const displayPhone = (user?.user_metadata?.phone as string | undefined) ?? "";
  const displayAvatar = (user?.user_metadata?.avatar_url as string | undefined) ?? "";
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const { addresses: savedAddresses, refreshAddresses } = useAddress();
  const activePreferences = healthPreferences.filter((p) => p.enabled);
  const defaultAddress = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification settings updated");
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? null;

      const { error } = await apiCall("/delete-account", {
        method: "DELETE",
        token,
      });

      if (error) {
        toast.error(error);
        setDeletingAccount(false);
        return;
      }

      setShowDeleteDialog(false);
      await logout();
      navigate("/signup", { replace: true });
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          {/* Profile Header */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                  {displayName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">
                  {displayName}
                </h1>
                {displayPhone && (
                  <p className="text-sm text-muted-foreground">{displayPhone}</p>
                )}
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" variant="secondary" className="flex-1">
                <Link to="/profile/edit">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
            {joinedDate && (
              <p className="mt-3 text-xs text-muted-foreground">
                Member since {joinedDate}
              </p>
            )}
          </div>

          {/* ── Addresses ── */}
          <ProfileSection title="Saved Addresses">
            {savedAddresses.length === 0 ? (
              /* Empty state */
              <div className="px-4 py-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No saved addresses yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Add a delivery address for faster checkout
                </p>
                <Button
                  size="sm"
                  className="mt-3 rounded-full"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Address
                </Button>
              </div>
            ) : (
              <>
                {/* Show up to 3 addresses inline */}
                {savedAddresses.slice(0, 3).map((addr, idx) => {
                  const Icon = addressLabelIcon(addr.label);
                  return (
                    <div key={addr.id}>
                      {idx > 0 && <div className="mx-4 border-t border-border" />}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${addr.is_default ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`h-4 w-4 ${addr.is_default ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{addr.label ?? "Home"}</p>
                            {addr.is_default && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {addr.address_line1}, {addr.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Actions row */}
                <div className="mx-4 border-t border-border" />
                <div className="flex items-center gap-2 px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add New
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-xs" asChild>
                    <Link to="/profile/addresses" className="flex items-center gap-1">
                      Manage all
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </ProfileSection>

          {/* Orders & Activity */}
          <ProfileSection title="Orders & Activity">
            <ProfileMenuItem
              icon={Package}
              label="My Orders"
              subtitle="View order history & track deliveries"
              href="/orders"
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={RefreshCw}
              label="Reorder"
              subtitle="Quickly reorder your favorites"
              href="/orders"
            />
          </ProfileSection>

          {/* Preferences */}
          <ProfileSection title="Preferences">
            <ProfileMenuItem
              icon={Sparkles}
              label="Health Preferences"
              subtitle={
                activePreferences.length > 0
                  ? activePreferences.map((p) => p.label).join(", ")
                  : "Set your dietary preferences"
              }
              href="/profile/preferences"
            />
          </ProfileSection>

          {/* Saved & Engagement */}
          <ProfileSection title="Saved & Engagement">
            <ProfileMenuItem
              icon={Heart}
              label="Saved Products"
              subtitle="Your wishlist & favorites"
              href="/profile/saved"
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={Star}
              label="Ratings & Reviews"
              subtitle="Products you've rated"
              href="/profile/ratings"
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={Clock}
              label="Recently Viewed"
              subtitle="Continue where you left off"
              href="/profile/recent"
            />
          </ProfileSection>

          {/* Payments */}
          <ProfileSection title="Payments">
            <ProfileMenuItem
              icon={CreditCard}
              label="Payment Methods"
              subtitle="Manage saved cards & UPI"
              href="/profile/payments"
            />
          </ProfileSection>

          {/* Theme */}
          <ProfileSection title="Appearance">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {resolvedTheme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === "system" ? "Following system" : resolvedTheme === "dark" ? "Dark theme" : "Light theme"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </div>
          </ProfileSection>

          {/* Notifications */}
          <ProfileSection title="Notifications">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Delivery & status notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={() => handleNotificationChange("orderUpdates")}
                />
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Offers & Promotions</p>
                    <p className="text-sm text-muted-foreground">
                      Deals, discounts & new arrivals
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.offersPromotions}
                  onCheckedChange={() =>
                    handleNotificationChange("offersPromotions")
                  }
                />
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">System Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Account & security alerts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.systemNotifications}
                  onCheckedChange={() =>
                    handleNotificationChange("systemNotifications")
                  }
                />
              </div>
            </div>
          </ProfileSection>

          {/* Help & Support */}
          <ProfileSection title="Help & Support">
            <ProfileMenuItem
              icon={HelpCircle}
              label="Help Center"
              subtitle="FAQs & troubleshooting"
              href="/profile/help"
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={HelpCircle}
              label="Contact Support"
              subtitle="Message or call us"
              href="/contact"
            />
          </ProfileSection>

          {/* About & Legal */}
          <ProfileSection title="About & Legal">
            <ProfileMenuItem
              icon={Info}
              label="About PURVITA"
              subtitle="Our story & mission"
              href="/profile/about"
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={FileText}
              label="Terms & Conditions"
              href="/profile/terms"
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={Shield}
              label="Privacy Policy"
              href="/profile/privacy"
            />
            <div className="mx-4 border-t border-border" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">App Version</p>
              </div>
              <p className="text-sm text-muted-foreground">v2.1.0</p>
            </div>
          </ProfileSection>

          {/* Account Actions */}
          <ProfileSection>
            <ProfileMenuItem
              icon={LogOut}
              label="Logout"
              onClick={() => setShowLogoutDialog(true)}
            />
            <div className="mx-4 border-t border-border" />
            <ProfileMenuItem
              icon={Trash2}
              label="Delete Account"
              variant="danger"
              onClick={() => setShowDeleteDialog(true)}
            />
          </ProfileSection>

          {/* Spacer for footer */}
          <div className="h-8" />
        </motion.div>
      </main>

      {/* Add Address Modal (from Profile) */}
      <AddressFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        token={session?.access_token ?? null}
        onSuccess={async () => {
          setShowAddModal(false);
          await refreshAddresses();
          toast.success("Address saved!");
        }}
      />

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout from your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { if (!deletingAccount) setShowDeleteDialog(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account, order history, and all saved data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAccount ? "Deleting…" : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default ProfilePage;
