import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: null,
    email: null,
    phone: null,
    avatar_url: null,
  });
  const [formData, setFormData] = useState({ name: "", phone: "" });

  // ── Fetch profile from ecommerce.customer_profiles ──────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_my_profile");

      if (error) {
        toast.error("Could not load your profile. Please try again.");
        console.error("[EditProfile] get_my_profile:", error.message);
      } else if (data && data.length > 0) {
        const row = data[0] as ProfileData;
        setProfile(row);
        setFormData({
          name: row.full_name ?? "",
          phone: row.phone ?? "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // ── Save changes ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("update_my_profile", {
      p_full_name: formData.name.trim() || null,
      p_phone: formData.phone.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to save changes. Please try again.");
      console.error("[EditProfile] update_my_profile:", error.message);
    } else {
      toast.success("Profile updated successfully!");
      navigate("/profile");
    }
  };

  const initials = getInitials(profile.full_name, profile.email ?? user?.email);
  const displayEmail = profile.email ?? user?.email ?? "";

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-lg space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-36 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            </div>
            <div className="rounded-xl bg-card p-6 shadow-sm space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Edit Profile</h1>
          </div>

          {/* Avatar */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? "Profile"} />
                <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Tap to change photo</p>
          </div>

          {/* Form */}
          <div className="space-y-5 rounded-xl bg-card p-6 shadow-sm">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email — read-only (managed by Supabase Auth) */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
                <span className="ml-2 text-xs font-normal text-muted-foreground">(cannot be changed here)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={displayEmail}
                readOnly
                disabled
                className="cursor-not-allowed opacity-70"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone.replace(/^\+91\s*/, "")}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="flex-1"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/profile")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfilePage;
