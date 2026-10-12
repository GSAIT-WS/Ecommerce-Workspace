import { LogOut } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const ADMIN_AUTH_KEY = "purvita_admin_authenticated";

const AdminDashboardPage = () => {
  usePageTitle("Admin Dashboard");
  const navigate = useNavigate();
  const isAuthenticated = sessionStorage.getItem(ADMIN_AUTH_KEY) === "1";

  if (!isAuthenticated) return <Navigate to="/admin-login" replace />;

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    navigate("/admin-login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-8">
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight text-primary">
              PURVITA
            </p>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-10 md:px-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dashboard features will be added here.
        </p>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
