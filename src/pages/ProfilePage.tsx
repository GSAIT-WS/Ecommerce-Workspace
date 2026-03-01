import { useState } from "react";
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
} from "lucide-react";
import { Moon, Sun } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileMenuItem from "@/components/profile/ProfileMenuItem";
import ProfileSection from "@/components/profile/ProfileSection";
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
  userProfile,
  healthPreferences,
  savedAddresses,
  notificationSettings,
} from "@/data/user";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

const ProfilePage = () => {
  const [notifications, setNotifications] = useState(notificationSettings);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const activePreferences = healthPreferences.filter((p) => p.enabled);
  const defaultAddress = savedAddresses.find((a) => a.isDefault);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification settings updated");
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    setShowLogoutDialog(false);
  };

  const handleDeleteAccount = () => {
    toast.success("Account deletion request submitted");
    setShowDeleteDialog(false);
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
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                  {userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">
                  {userProfile.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userProfile.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.email}
                </p>
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
            <p className="mt-3 text-xs text-muted-foreground">
              Member since {userProfile.joinedDate}
            </p>
          </div>

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

          {/* Addresses */}
          <ProfileSection title="Addresses">
            <ProfileMenuItem
              icon={MapPin}
              label="Saved Addresses"
              subtitle={
                defaultAddress
                  ? `${defaultAddress.label}: ${defaultAddress.address.substring(0, 30)}...`
                  : "Add delivery addresses"
              }
              href="/profile/addresses"
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
              subtitle="Chat or call us"
              onClick={() => toast.info("Support chat coming soon!")}
            />
          </ProfileSection>

          {/* About & Legal */}
          <ProfileSection title="About & Legal">
            <ProfileMenuItem
              icon={Info}
              label="About CRUNCHX"
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
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account, order history, and all saved data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default ProfilePage;
