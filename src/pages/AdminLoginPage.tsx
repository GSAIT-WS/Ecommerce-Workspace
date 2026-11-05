import { FormEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";
import logo from "@/assets/logo-trimmed.png";
import logoCream from "@/assets/logo-cream.png";

const ADMIN_AUTH_KEY = "purvita_admin_authenticated";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

const AdminLoginPage = () => {
  usePageTitle("Admin Login");
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(ADMIN_AUTH_KEY) === "1",
  );

  if (isAuthenticated) return <Navigate to="/admin-dashboard" replace />;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Incorrect email or password.");
      return;
    }

    sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
    setIsAuthenticated(true);
    navigate("/admin-dashboard", { replace: true });
  };

  return (
    <main className="admin-login flex min-h-screen bg-background">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative hidden overflow-hidden lg:flex lg:w-1/2"
      >
        <motion.img
          src="/banner-ingredients.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#352036]/80 via-primary/65 to-[#34552d]/70" />
        <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: EASE.smooth }}
          >
            <Link to="/" aria-label="PURVITA home" className="inline-flex w-fit rounded-xl bg-[#352036]/20 p-2">
              <img src={logoCream} alt="PURVITA" className="h-14 w-auto" />
            </Link>
          </motion.div>
          <motion.div
            className="max-w-md text-white"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.65, ease: EASE.smooth }}
          >
            <h1 className="admin-hero-title mb-3 font-display text-4xl font-extrabold">PURVITA Admin</h1>
            <p className="text-lg text-white/80">
              Sign in to access the administration portal.
            </p>
          </motion.div>
          <motion.p
            className="text-sm text-white/65"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: EASE.smooth }}
          >
            Wholesome snacking, thoughtfully made.
          </motion.p>
        </div>
      </motion.div>

      <motion.section
        className="flex min-h-screen flex-1 items-center justify-center px-5 py-12 sm:px-8"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE.smooth }}
      >
        <div className="w-full max-w-md">
          <Link to="/" aria-label="PURVITA home" className="mb-10 inline-flex lg:hidden">
            <img src={logo} alt="PURVITA" className="h-14 w-auto" />
          </Link>

          <motion.div
            className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.4, ease: EASE.smooth }}
          >
            <ShieldCheck className="h-6 w-6" />
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45, ease: EASE.smooth }}
          >
            <h1 className="admin-form-title font-display text-3xl font-extrabold tracking-tight text-foreground">
              PURVITA Admin
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your administrator account.
            </p>
          </motion.div>

          <motion.form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EASE.smooth }}
          >
            <motion.div
              className="space-y-2"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.4, ease: EASE.smooth }}
            >
              <Label htmlFor="admin-email">Email address</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                required
                className="h-11 rounded-xl"
                aria-invalid={!!error}
                onChange={() => setError("")}
              />
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.4, ease: EASE.smooth }}
            >
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className="h-11 rounded-xl pr-11"
                  aria-invalid={!!error}
                  onChange={() => setError("")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>
            {error && (
              <motion.p
                role="alert"
                className="text-sm font-medium text-destructive"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.64, duration: 0.4, ease: EASE.smooth }}
            >
              <Button type="submit" className="h-11 w-full rounded-xl">
                Sign In
              </Button>
            </motion.div>
          </motion.form>

          <motion.p
            className="mt-4 text-center text-xs text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.4, ease: EASE.smooth }}
          >
            Development testing only. Do not use these credentials in production.
          </motion.p>

          <motion.div
            className="mt-8 border-t border-border pt-6 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4, ease: EASE.smooth }}
          >
            <Button variant="ghost" asChild className="rounded-full text-muted-foreground">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Return to customer login
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
};

export default AdminLoginPage;
