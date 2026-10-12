import { FormEvent, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks/usePageTitle";

const ADMIN_AUTH_KEY = "purvita_admin_authenticated";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

const AdminLoginPage = () => {
  usePageTitle("Admin Login");
  const navigate = useNavigate();
  const [error, setError] = useState("");
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
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <img
          src="/banner-ingredients.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/75 via-primary/65 to-green-900/70" />
        <div className="relative flex min-h-screen flex-col justify-between p-12">
          <Link
            to="/"
            className="font-display text-3xl font-extrabold tracking-tight text-white"
          >
            PURVITA
          </Link>
          <div className="max-w-md text-white">
            <h1 className="mb-3 text-4xl font-extrabold">PURVITA Admin</h1>
            <p className="text-lg text-white/80">
              Sign in to access the administration portal.
            </p>
          </div>
          <p className="text-sm text-white/65">Wholesome snacking, thoughtfully made.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-block font-display text-3xl font-extrabold tracking-tight text-primary lg:hidden"
          >
            PURVITA
          </Link>

          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            PURVITA Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your administrator account.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="h-11 rounded-xl"
                aria-invalid={!!error}
                onChange={() => setError("")}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 w-full rounded-xl">
              Sign In
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Development testing only. Do not use these credentials in production.
          </p>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <Button variant="ghost" asChild className="rounded-full text-muted-foreground">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Return to customer login
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminLoginPage;
