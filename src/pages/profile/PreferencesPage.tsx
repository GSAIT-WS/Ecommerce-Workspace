import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { healthPreferences as initialPreferences } from "@/data/user";
import { toast } from "sonner";

const PreferencesPage = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(initialPreferences);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    toast.success("Preferences saved successfully!");
    navigate("/profile");
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
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Health Preferences</h1>
              <p className="text-sm text-muted-foreground">
                Personalize your product recommendations
              </p>
            </div>
          </div>

          {/* Preferences Grid */}
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {preferences.map((pref) => (
                <motion.button
                  key={pref.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePreference(pref.id)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    pref.enabled
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {pref.enabled && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-2xl">{pref.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      pref.enabled ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {pref.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Info */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Your preferences help us show products that match your dietary needs
          </p>

          {/* Save Button */}
          <div className="mt-6">
            <Button className="w-full" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PreferencesPage;
