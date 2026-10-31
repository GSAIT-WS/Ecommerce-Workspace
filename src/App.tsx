import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AddressProvider } from "./context/AddressContext";
import ProtectedRoute, { PublicRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import PreferencesPage from "./pages/profile/PreferencesPage";
import AddressesPage from "./pages/profile/AddressesPage";
import SavedProductsPage from "./pages/profile/SavedProductsPage";
import RatingsPage from "./pages/profile/RatingsPage";
import RecentlyViewedPage from "./pages/profile/RecentlyViewedPage";
import PaymentMethodsPage from "./pages/profile/PaymentMethodsPage";
import HelpCenterPage from "./pages/profile/HelpCenterPage";
import ProfileAboutPage from "./pages/profile/AboutPage";
import TermsPage from "./pages/profile/TermsPage";
import PrivacyPage from "./pages/profile/PrivacyPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ShippingInfoPage from "./pages/ShippingInfoPage";
import ReturnsRefundsPage from "./pages/ReturnsRefundsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PostLoginAddressPrompt from "./components/address/PostLoginAddressPrompt";
import ProductRealtimeSync from "./components/ProductRealtimeSync";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        {/* reducedMotion="user" makes every framer-motion animation in the app
            respect the OS "reduce motion" setting, not just the CSS ones. */}
        <MotionConfig reducedMotion="user">
        <AuthProvider>
          <AddressProvider>
          <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <ProductRealtimeSync />
            {/* Global one-time address prompt shown after login when user has no addresses */}
            <PostLoginAddressPrompt />
            <PageTransition>
            <Routes>
              {/* Public routes — accessible to everyone, authenticated or not */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/shipping-info" element={<ShippingInfoPage />} />
              <Route path="/returns-refunds" element={<ReturnsRefundsPage />} />
              {/* Auth routes — redirect to / when already logged in */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin-dashboard/*" element={<AdminDashboardPage />} />

              {/* Protected routes — redirect to /login when not logged in */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order/:orderId" element={<OrderDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/profile/preferences" element={<PreferencesPage />} />
                <Route path="/profile/addresses" element={<AddressesPage />} />
                <Route path="/profile/saved" element={<SavedProductsPage />} />
                <Route path="/profile/ratings" element={<RatingsPage />} />
                <Route path="/profile/recent" element={<RecentlyViewedPage />} />
                <Route path="/profile/payments" element={<PaymentMethodsPage />} />
                <Route path="/profile/help" element={<HelpCenterPage />} />
                <Route path="/profile/about" element={<ProfileAboutPage />} />
                <Route path="/profile/terms" element={<TermsPage />} />
                <Route path="/profile/privacy" element={<PrivacyPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </PageTransition>
          </BrowserRouter>
          </CartProvider>
          </AddressProvider>
        </AuthProvider>
        </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
