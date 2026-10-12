import { useState, useRef, KeyboardEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowLeft, Smartphone, UserX, Leaf, Zap, Star, ShieldCheck, Home, FlaskConical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { normalizePhoneToE164 } from "@/lib/phoneAuth";
import { toast } from "sonner";

export type AuthGatewayMode = "login" | "signup";

type Step = "choose" | "email" | "emailOtp" | "phone" | "phoneOtp";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email.trim());
}

const MSG_NO_USER_EMAIL = "No account found with this email.";
const MSG_NO_USER_PHONE = "No account found with this number.";

const FEATURES = [
  { icon: Leaf, text: "100% Natural Ingredients", color: "text-emerald-300" },
  { icon: Zap, text: "Delivered in 24 Hours", color: "text-amber-300" },
  { icon: Star, text: "Curated by Nutritionists", color: "text-yellow-300" },
  { icon: ShieldCheck, text: "Safe & Quality Assured", color: "text-sky-300" },
];

async function rpcEmailRegistered(email: string): Promise<{ ok: true; registered: boolean } | { ok: false }> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.rpc("check_email_registered", { p_email: normalized });
  if (error) { console.warn("[auth] check_email_registered:", error.message); return { ok: false }; }
  if (typeof data !== "boolean") { console.warn("[auth] check_email_registered: expected boolean, got", data); return { ok: false }; }
  return { ok: true, registered: data };
}

async function rpcPhoneRegistered(phoneE164: string): Promise<{ ok: true; registered: boolean } | { ok: false }> {
  const { data, error } = await supabase.rpc("check_phone_registered", { p_phone: phoneE164.trim() });
  if (error) { console.warn("[auth] check_phone_registered:", error.message); return { ok: false }; }
  if (typeof data !== "boolean") { console.warn("[auth] check_phone_registered: expected boolean, got", data); return { ok: false }; }
  return { ok: true, registered: data };
}

export interface AuthGatewayProps {
  mode: AuthGatewayMode;
}

/* ── OTP Box Input ─────────────────────────────────────────────────────────── */
function OtpBoxes({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = 6;

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, char: string) => {
    const d = char.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(digits, " ").split("");
    arr[i] = d || " ";
    const next = arr.join("").trimEnd();
    onChange(next);
    if (d && i < digits - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    if (pasted) { onChange(pasted); refs.current[Math.min(pasted.length, digits - 1)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: digits }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] && value[i] !== " " ? value[i] : ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          whileFocus={{ scale: 1.08 }}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-border bg-background
            focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
            transition-all duration-150 disabled:opacity-50 caret-transparent
            aspect-square"
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export function AuthGateway({ mode }: AuthGatewayProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginEmailNotFound, setShowLoginEmailNotFound] = useState(false);
  const [showLoginPhoneNotFound, setShowLoginPhoneNotFound] = useState(false);

  const [showTestLogin, setShowTestLogin] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [testShowPw, setTestShowPw] = useState(false);
  const [testSubmitting, setTestSubmitting] = useState(false);

  const isLogin = mode === "login";
  const alternateHref = isLogin ? "/signup" : "/login";
  const alternateLabel = isLogin ? "Create account" : "Sign in";

  const goHome = () => {
    setStep("choose"); setEmail(""); setPhoneInput(""); setPhoneE164(""); setOtp("");
    setShowLoginEmailNotFound(false); setShowLoginPhoneNotFound(false);
  };

  const finishSuccess = () => {
    toast.success(isLogin ? "Welcome back!" : "Welcome to PURVITA!");
    navigate(from, { replace: true });
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) toast.error("Google sign-in failed. Enable the Google provider in Supabase.");
    } catch { toast.error("Google sign-in failed."); }
  };

  const handleSendEmailOtp = async () => {
    if (!isValidEmail(email)) { toast.error("Please enter a valid email address"); return; }
    setSubmitting(true); setShowLoginEmailNotFound(false);
    const check = await rpcEmailRegistered(email);
    if (!check.ok) { setSubmitting(false); toast.error("Could not verify this email. Try again or use Google / phone."); return; }
    if (isLogin && !check.registered) { setSubmitting(false); setShowLoginEmailNotFound(true); toast.error(MSG_NO_USER_EMAIL); return; }
    if (!isLogin && check.registered) { setSubmitting(false); toast.error("This email already has an account. Sign in instead."); return; }
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: !isLogin } });
    setSubmitting(false);
    if (error) { toast.error(error.message ?? "Failed to send code."); return; }
    toast.success(`Code sent to ${email.trim()}`);
    setStep("emailOtp");
  };

  const handleVerifyEmailOtp = async () => {
    if (!email.trim()) { toast.error("Something went wrong. Go back and request a new code."); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp, type: "email" });
    setSubmitting(false);
    if (error) { toast.error(error.message ?? "Invalid code."); return; }
    finishSuccess();
  };

  const handleSendPhoneOtp = async () => {
    const e164 = normalizePhoneToE164(phoneInput);
    if (!e164) { toast.error("Enter a valid mobile number (10 digits or full international)."); return; }
    setSubmitting(true); setShowLoginPhoneNotFound(false);
    const check = await rpcPhoneRegistered(e164);
    if (!check.ok) { setSubmitting(false); toast.error("Could not verify this number. Try again or use Google / email."); return; }
    if (isLogin && !check.registered) { setSubmitting(false); setShowLoginPhoneNotFound(true); toast.error(MSG_NO_USER_PHONE); return; }
    if (!isLogin && check.registered) { setSubmitting(false); toast.error("This number already has an account. Sign in instead."); return; }
    const { error } = await supabase.auth.signInWithOtp({ phone: e164, options: { shouldCreateUser: !isLogin } });
    setSubmitting(false);
    if (error) { toast.error(error.message ?? "Failed to send SMS. Enable Phone provider in Supabase."); return; }
    setPhoneE164(e164);
    toast.success("Code sent to your phone");
    setStep("phoneOtp");
  };

  const handleVerifyPhoneOtp = async () => {
    const phone = phoneE164 || normalizePhoneToE164(phoneInput);
    if (!phone) { toast.error("Missing phone number."); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setSubmitting(false);
    if (error) { toast.error(error.message ?? "Invalid code."); return; }
    finishSuccess();
  };

  const handleBack = () => {
    if (step === "emailOtp") { setStep("email"); setOtp(""); }
    else if (step === "phoneOtp") { setStep("phone"); setOtp(""); }
    else goHome();
  };

  const handleTestLogin = async () => {
    if (!testEmail.trim() || !testPassword) {
      toast.error("Enter email and password");
      return;
    }
    setTestSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: testEmail.trim().toLowerCase(),
      password: testPassword,
    });
    if (error) {
      setTestSubmitting(false);
      toast.error(error.message ?? "Login failed");
      return;
    }

    // Enforce ecommerce guard immediately for internal password login as well.
    await supabase.rpc("activate_customer_profile");
    const { data: isCustomer, error: guardError } = await supabase.rpc(
      "is_ecommerce_customer"
    );
    setTestSubmitting(false);

    if (guardError || isCustomer !== true) {
      await supabase.auth.signOut();
      toast.error(
        "Access denied. This account is inactive or not registered as a PURVITA customer."
      );
      return;
    }

    toast.success("Signed in (test)");
    navigate(from, { replace: true });
  };

  const stepTitle: Record<Step, string> = {
    choose: isLogin ? "Welcome back!" : "Create account",
    email: "Continue with Email",
    emailOtp: "Check your inbox",
    phone: "Continue with Mobile",
    phoneOtp: "Enter SMS code",
  };

  const stepSubtitle: Record<Step, string> = {
    choose: isLogin ? "Sign in to your PURVITA account" : "Start your healthy snacking journey",
    email: isLogin ? "We'll send a sign-in code to your email" : "We'll send a code to verify your email",
    emailOtp: `We sent a 6-digit code to ${email || "your email"}`,
    phone: isLogin ? "We'll send a sign-in code via SMS" : "We'll send a code to verify your number",
    phoneOtp: `Code sent to ${phoneE164 || phoneInput}`,
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
  };
  const dir = step === "choose" ? -1 : 1;

  return (
    <div className="flex min-h-screen">

      {/* ── Left Panel ──────────────────────────────────────────────────────── */}
      <motion.div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Background image */}
        <motion.img
          src="/banner-ingredients.png"
          alt="Multigrain bars with nuts, seeds and grains"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "saturate(1.18) contrast(1.06) brightness(0.92)" }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        {/* Gradient overlays — unchanged */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/75 via-primary/65 to-green-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Decorative floating circles */}
        <motion.div
          className="absolute top-16 right-16 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-12 w-48 h-48 rounded-full bg-green-400/15 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/" className="inline-block font-display text-3xl font-extrabold tracking-tight text-white drop-shadow">
              PURVITA
            </Link>
          </motion.div>

          {/* Headline */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <h2 className="text-5xl font-extrabold leading-[1.12] text-white drop-shadow-md">
                Snack Smart,<br />
                <span className="text-amber-300">Live Healthy.</span>
              </h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-xs">
                Discover wholesome snacks packed with nutrition and incredible taste — delivered fresh to your door.
              </p>
            </motion.div>

            {/* Feature pills */}
            <div className="flex flex-col gap-3">
              {FEATURES.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/15 w-fit"
                >
                  <div className="p-1.5 bg-white/15 rounded-lg">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-white/90">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer trust text */}
          <motion.p
            className="text-white/50 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            ✦ Trusted by 10,000+ happy customers across India
          </motion.p>
        </div>
      </motion.div>

      {/* ── Right Panel ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="font-display text-3xl font-extrabold tracking-tight text-primary">
              PURVITA
            </Link>
          </div>

          {/* Step header text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step + "-header"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-7"
            >
              {step !== "choose" && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Back
                </button>
              )}
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                {stepTitle[step]}
              </h1>
              <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                {stepSubtitle[step]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form card */}
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-6">
              <AnimatePresence mode="wait" custom={dir}>

                {/* ── Choose step ──────────────────────────────────────────── */}
                {step === "choose" && (
                  <motion.div
                    key="choose"
                    custom={-1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22 }}
                    className="space-y-3"
                  >
                    {/* Google */}
                    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 gap-3 text-base font-semibold border-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
                        onClick={() => void handleGoogle()}
                        disabled={submitting}
                      >
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                    </motion.div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium px-1">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Phone */}
                    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 gap-3 text-base font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
                        onClick={() => { setShowLoginPhoneNotFound(false); setStep("phone"); }}
                        disabled={submitting}
                      >
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        Continue with mobile number
                      </Button>
                    </motion.div>

                    {/* Email */}
                    <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 gap-3 text-base font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
                        onClick={() => { setShowLoginEmailNotFound(false); setStep("email"); }}
                        disabled={submitting}
                      >
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        Continue with email
                      </Button>
                    </motion.div>

                    <p className="pt-1 text-center text-xs text-muted-foreground">
                      We send a one-time code — no passwords needed.
                    </p>
                  </motion.div>
                )}

                {/* ── Email step ───────────────────────────────────────────── */}
                {step === "email" && (
                  <motion.div
                    key="email"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-email" className="text-sm font-semibold">Email address</Label>
                      <Input
                        id="auth-email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (isLogin) setShowLoginEmailNotFound(false); }}
                        disabled={submitting}
                        className="h-12 rounded-xl text-base"
                        onKeyDown={(e) => e.key === "Enter" && void handleSendEmailOtp()}
                      />
                    </div>

                    <AnimatePresence>
                      {isLogin && showLoginEmailNotFound && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/40"
                        >
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{MSG_NO_USER_EMAIL}</p>
                          </div>
                          <p className="pl-6 text-xs text-red-600 dark:text-red-400">
                            <Link to="/signup" state={location.state} className="font-semibold underline underline-offset-2">
                              Create an account
                            </Link>{" "}if you're new here.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        className="w-full h-12 text-base font-semibold rounded-xl"
                        onClick={() => void handleSendEmailOtp()}
                        disabled={submitting}
                      >
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send code →"}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Email OTP step ───────────────────────────────────────── */}
                {step === "emailOtp" && (
                  <motion.div
                    key="emailOtp"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22 }}
                    className="space-y-5"
                  >
                    <div className="rounded-2xl bg-primary/8 border border-primary/15 px-4 py-3 text-sm text-center">
                      <span className="text-muted-foreground">Code sent to </span>
                      <span className="font-bold text-foreground">{email}</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-center block">Enter 6-digit code</Label>
                      <OtpBoxes value={otp} onChange={setOtp} disabled={submitting} />
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        className="w-full h-12 text-base font-semibold rounded-xl"
                        onClick={() => void handleVerifyEmailOtp()}
                        disabled={submitting || otp.replace(/\s/g, "").length < 6}
                      >
                        {submitting
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
                          : isLogin ? "Sign in →" : "Create account →"}
                      </Button>
                    </motion.div>

                    <p className="text-center text-sm text-muted-foreground">
                      Didn't receive it?{" "}
                      <button
                        type="button"
                        onClick={() => void handleSendEmailOtp()}
                        disabled={submitting}
                        className="font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    </p>
                  </motion.div>
                )}

                {/* ── Phone step ───────────────────────────────────────────── */}
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-phone" className="text-sm font-semibold">Mobile number</Label>
                      <Input
                        id="auth-phone"
                        type="tel"
                        autoComplete="tel"
                        autoFocus
                        placeholder="9876543210 or +919876543210"
                        value={phoneInput}
                        onChange={(e) => { setPhoneInput(e.target.value); if (isLogin) setShowLoginPhoneNotFound(false); }}
                        disabled={submitting}
                        className="h-12 rounded-xl text-base"
                        onKeyDown={(e) => e.key === "Enter" && void handleSendPhoneOtp()}
                      />
                      <p className="text-xs text-muted-foreground">
                        Indian numbers: enter 10 digits or full +91 international format.
                      </p>
                    </div>

                    <AnimatePresence>
                      {isLogin && showLoginPhoneNotFound && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/40"
                        >
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{MSG_NO_USER_PHONE}</p>
                          </div>
                          <p className="pl-6 text-xs text-red-600 dark:text-red-400">
                            <Link to="/signup" state={location.state} className="font-semibold underline underline-offset-2">
                              Create an account
                            </Link>{" "}if you're new here.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        className="w-full h-12 text-base font-semibold rounded-xl"
                        onClick={() => void handleSendPhoneOtp()}
                        disabled={submitting}
                      >
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send SMS code →"}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── Phone OTP step ───────────────────────────────────────── */}
                {step === "phoneOtp" && (
                  <motion.div
                    key="phoneOtp"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22 }}
                    className="space-y-5"
                  >
                    <div className="rounded-2xl bg-primary/8 border border-primary/15 px-4 py-3 text-sm text-center">
                      <span className="text-muted-foreground">Code sent to </span>
                      <span className="font-bold text-foreground">{phoneE164 || phoneInput}</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-center block">Enter SMS code</Label>
                      <OtpBoxes value={otp} onChange={setOtp} disabled={submitting} />
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        className="w-full h-12 text-base font-semibold rounded-xl"
                        onClick={() => void handleVerifyPhoneOtp()}
                        disabled={submitting || otp.replace(/\s/g, "").length < 6}
                      >
                        {submitting
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
                          : isLogin ? "Sign in →" : "Create account →"}
                      </Button>
                    </motion.div>

                    <p className="text-center text-sm text-muted-foreground">
                      Didn't receive it?{" "}
                      <button
                        type="button"
                        onClick={() => void handleSendPhoneOtp()}
                        disabled={submitting}
                        className="font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Toggle login / signup */}
          <motion.p
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isLogin ? "New to PURVITA? " : "Already have an account? "}
            <Link
              to={alternateHref}
              state={location.state}
              className="font-bold text-primary hover:underline underline-offset-2"
            >
              {alternateLabel}
            </Link>
          </motion.p>

          {isLogin && (
            <motion.div
              className="mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <Button variant="outline" size="lg" className="w-full rounded-xl" asChild>
                <Link to="/admin-login">Admin Login</Link>
              </Button>
            </motion.div>
          )}

          {/* Return to homepage */}
          <motion.div
            className="mt-4 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <Home className="h-3.5 w-3.5" />
              Return to Homepage
            </Link>
          </motion.div>

          {/* ── Internal test login (password-based, for team use only) ── */}
          {isLogin && (
            <motion.div
              className="mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="button"
                onClick={() => setShowTestLogin((v) => !v)}
                className="mx-auto flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                <FlaskConical className="h-3 w-3" />
                Login for testing
              </button>

              <AnimatePresence>
                {showTestLogin && (
                  <motion.div
                    key="test-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/40 p-4 space-y-3">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-center">
                        Internal / Testing Only
                      </p>

                      {/* Email */}
                      <div className="space-y-1">
                        <Label htmlFor="test-email" className="text-xs text-muted-foreground">Email</Label>
                        <Input
                          id="test-email"
                          type="email"
                          autoComplete="email"
                          placeholder="test@example.com"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          disabled={testSubmitting}
                          className="h-9 rounded-xl text-sm"
                          onKeyDown={(e) => e.key === "Enter" && void handleTestLogin()}
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <Label htmlFor="test-password" className="text-xs text-muted-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            id="test-password"
                            type={testShowPw ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={testPassword}
                            onChange={(e) => setTestPassword(e.target.value)}
                            disabled={testSubmitting}
                            className="h-9 rounded-xl pr-9 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && void handleTestLogin()}
                          />
                          <button
                            type="button"
                            onClick={() => setTestShowPw((v) => !v)}
                            tabIndex={-1}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {testShowPw
                              ? <EyeOff className="h-3.5 w-3.5" />
                              : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full h-9 rounded-xl text-sm font-semibold"
                        onClick={() => void handleTestLogin()}
                        disabled={testSubmitting}
                      >
                        {testSubmitting
                          ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Signing in…</>
                          : "Sign in with password"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Terms note */}
          <p className="mt-3 text-center text-xs text-muted-foreground/70">
            By continuing, you agree to our{" "}
            <Link to="/terms-of-service" className="underline hover:text-muted-foreground">Terms</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="underline hover:text-muted-foreground">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
