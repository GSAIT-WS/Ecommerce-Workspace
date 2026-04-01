import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPageBackdrop } from "@/components/auth/AuthPageBackdrop";
import {
  authContainerVariants,
  authFieldVariants,
  authFormGroupVariants,
  authItemVariants,
} from "@/components/auth/authMotion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    const { error } = await signup(email, password);
    setSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Signup failed. Please try again.");
    } else {
      toast.success(
        "Account created! Check your email to confirm your address."
      );
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthPageBackdrop>
      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={authContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={authItemVariants} className="relative z-20 mb-6 text-center">
          <Link
            to="/"
            className="font-display inline-block text-3xl font-extrabold tracking-tight text-primary transition-transform duration-300 hover:scale-[1.02]"
          >
            CRUNCH<span className="text-secondary">X</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Join us for wholesome snacks & healthy treats
          </p>
        </motion.div>

        <div className="relative z-0 px-0.5">
          <motion.div
            variants={authItemVariants}
            className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.12] via-accent/25 to-secondary/[0.14] px-4 py-3 shadow-sm backdrop-blur-md dark:from-primary/15 dark:via-accent/10 dark:to-secondary/20"
            aria-label="What we offer"
          >
            <motion.div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,hsl(var(--background)/0.35)_45%,transparent_90%)]"
              animate={{ x: ["-30%", "130%"] }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                repeatDelay: 2,
              }}
            />
            <div className="relative flex items-center justify-center gap-2.5 text-center sm:gap-3">
              <motion.span
                className="flex shrink-0 text-secondary"
                animate={{ rotate: [0, 6, -4, 0] }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Leaf className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
              </motion.span>
              <p className="text-xs font-medium leading-snug text-foreground/90 sm:text-sm">
                Multigrain snacks & nutritious bites —{" "}
                <span className="text-secondary">delivered fresh</span> to your door
              </p>
              <Sparkles className="h-4 w-4 shrink-0 text-primary opacity-90 sm:h-[18px] sm:w-[18px]" />
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={authItemVariants}
          className="relative z-10 -mt-3 rounded-2xl border border-border/80 bg-card/95 p-7 shadow-lg shadow-primary/[0.06] backdrop-blur-md dark:bg-card/90 sm:p-8"
        >
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={authFormGroupVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={authFieldVariants} className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 transition-shadow duration-200 focus-visible:ring-primary/40"
                  disabled={submitting}
                />
              </div>
            </motion.div>

            <motion.div variants={authFieldVariants} className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 transition-shadow duration-200 focus-visible:ring-primary/40"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div variants={authFieldVariants} className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 transition-shadow duration-200 focus-visible:ring-primary/40"
                  disabled={submitting}
                />
              </div>
            </motion.div>

            <motion.div variants={authFieldVariants} className="pt-0.5">
              <Button
                type="submit"
                className="w-full transition-transform duration-200 active:scale-[0.99]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </AuthPageBackdrop>
  );
};

export default SignupPage;
