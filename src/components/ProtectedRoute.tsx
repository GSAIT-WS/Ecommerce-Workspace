import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

// ── Auth loading spinner ───────────────────────────────────────────────────
const AuthSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// ── ProtectedRoute ─────────────────────────────────────────────────────────
// Use as a wrapper element OR as a layout route (renders <Outlet /> for
// nested <Route> children when no `children` prop is passed).
interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

// ── PublicRoute ────────────────────────────────────────────────────────────
// Redirects already-authenticated users away from /login and /signup.
export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <AuthSpinner />;

  // Already signed in — send to homepage, no reason to see login/signup
  if (user) return <Navigate to="/home" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
