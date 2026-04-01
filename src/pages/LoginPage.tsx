import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ShoppingBag, Sparkles, UserX } from "lucide-react";
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
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noAccountFound, setNoAccountFound] = useState(false);

  const from = (location.state as { from?: string })?.from ?? "/";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (noAccountFound) setNoAccountFound(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoAccountFound(false);

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    const { error } = await login(email, password);

    if (error) {
      // Check whether the email is registered so we can show a specific message
      const { data: isRegistered } = await supabase.rpc("check_email_registered", {
        p_email: email,
      });

      setSubmitting(false);

      if (isRegistered === false) {
        setNoAccountFound(true);
      } else {
        toast.error("Incorrect password. Please try again.");
      }
    } else {
      setSubmitting(false);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
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
            Sign in to shop wholesome snacks & healthy treats
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
                className="flex shrink-0 text-primary"
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
              </motion.span>
              <p className="text-xs font-medium leading-snug text-foreground/90 sm:text-sm">
                Your healthy favourites —{" "}
                <span className="text-secondary">ready to reorder</span> anytime
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
                  onChange={handleEmailChange}
                  className="pl-9 transition-shadow duration-200 focus-visible:ring-primary/40"
                  disabled={submitting}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {noAccountFound && (
                <motion.div
                  key="no-account-banner"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/40">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        No account found with this email
                      </p>
                    </div>
                    <p className="pl-6 text-xs text-red-600 dark:text-red-400">
                      This email isn't registered.{" "}
                      <Link
                        to="/signup"
                        className="font-semibold underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
                      >
                        Create an account
                      </Link>{" "}
                      to get started.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={authFieldVariants} className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
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

            <motion.div variants={authFieldVariants} className="space-y-3 pt-0.5">
              <Button
                type="submit"
                className="w-full transition-transform duration-200 active:scale-[0.99]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full border-primary/25 transition-transform duration-200 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99]"
                disabled={submitting}
                asChild
              >
                <Link to="/signup">Create Account</Link>
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </AuthPageBackdrop>
  );
};

export default LoginPage;
