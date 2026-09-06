import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AccountLayout from '../layouts/AccountLayout';
import { Loader2 } from 'lucide-react';

// Core entry page loaded directly for instant initial render
import HomePage from '../pages/HomePage';

// Route-level code-splitting for high performance
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

const CartPage = lazy(() => import('../pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('../pages/customer/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/customer/OrderSuccessPage'));
const OrdersPage = lazy(() => import('../pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/customer/OrderDetailPage'));
const WishlistPage = lazy(() => import('../pages/customer/WishlistPage'));
const SecurityPage = lazy(() => import('../pages/customer/SecurityPage'));
const NotificationPage = lazy(() => import('../pages/customer/NotificationPage'));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminCouponsPage = lazy(() => import('../pages/admin/AdminCouponsPage'));

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 dark:bg-brand-400/10 border border-brand-500/20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-600 dark:text-brand-400 animate-spin" />
      </div>
    </div>
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
      Loading TechNest...
    </span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Main / Public & User Routes */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Customer Account Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
          </Route>

          {/* Other Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:orderId"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
