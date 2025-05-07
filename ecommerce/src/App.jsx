import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { FavoriteProvider } from './contexts/FavoriteContext';
import { ThemeProvider } from './contexts/ThemeContext';

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
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOTP from './pages/VerifyOTP';
import ForgotPasswordPage from './pages/ForgotPassword';
import VerifyResetCodePage from './pages/VerifyResetCode';
import ResetPasswordPage from './pages/ResetPassword';
import ChangePasswordPage from './pages/ChangePassword';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import OrderSuccessPage from './pages/OrderSuccess';
import EditProfilePage from './pages/EditProfilePage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CartProvider>
        <FavoriteProvider>
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
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/settings" element={<AccountSettingsPage />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-reset-code" element={<VerifyResetCodePage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </FavoriteProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
