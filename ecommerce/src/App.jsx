import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";

// Pages
import HomePage from "./pages/Index";
import ProductsPage from "./pages/Products";
import ProductDetailPage from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import UserDashboardPage from "./pages/UserDashboard";
import AdminDashboardPage from "./pages/AdminDashboard";
import ChatPage from "./pages/Chat";
import FavoritesPage from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import PurchasesPage from "./pages/PurchasesPage";
import MessagesPage from "./pages/MessagesPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Router>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/settings" element={<AccountSettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
