import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CategoriesPage from "./pages/CategoriesPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
