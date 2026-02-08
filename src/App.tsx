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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
