import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import AccountLayout from '../layouts/AccountLayout';

import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderSuccessPage from '../pages/customer/OrderSuccessPage';
import OrdersPage from '../pages/customer/OrdersPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import WishlistPage from '../pages/customer/WishlistPage';
import SecurityPage from '../pages/customer/SecurityPage';
import NotificationPage from '../pages/customer/NotificationPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminCouponsPage from '../pages/admin/AdminCouponsPage';

export const AppRoutes: React.FC = () => {
  return (
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
  );
};

export default AppRoutes;
