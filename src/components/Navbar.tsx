import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchOverlay from "@/components/SearchOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import DeliveryLocationChip from "@/components/address/DeliveryLocationChip";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/search" },
  { label: "Categories", href: "/categories" },
  { label: "My Orders", href: "/orders" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">

          {/* Left: Logo + Delivery chip (desktop) */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-display text-2xl font-extrabold tracking-tight text-primary"
            >
              CRUNCH<span className="text-secondary">X</span>
            </Link>

            {/* Delivery location chip — only on desktop */}
            {user && (
              <div className="hidden md:block">
                <DeliveryLocationChip />
              </div>
            )}
          </div>

          {/* Centre: Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`font-body text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-primary"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/70 hover:text-primary"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground/70 hover:text-primary md:flex"
                  asChild
                >
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground/70 hover:text-destructive md:flex"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-foreground/70 hover:text-primary md:flex"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <nav className="border-t border-border bg-card px-4 py-4 md:hidden">

            {/* Delivery chip in mobile menu */}
            {user && (
              <div className="mb-3 pb-3 border-b border-border">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Delivery location
                </p>
                <DeliveryLocationChip
                  compact
                  onInteract={() => setMobileOpen(false)}
                />
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 font-body text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-border pt-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="block py-2 font-body text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 font-body text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;
