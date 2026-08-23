import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag, User, Heart, Cpu, LogOut, ShieldAlert } from 'lucide-react';
import { Toaster } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export const MainLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.cartItemCount);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      <Toaster position="top-right" richColors closeButton theme="dark" />

      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800/80 shadow-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Tech<span className="text-cyan-400">Nest</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-cyan-400 transition-colors">Products</Link>
            {isAdmin && (
              <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-semibold">
                <ShieldAlert className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/wishlist" 
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors relative border border-slate-700/50"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link 
              to="/cart" 
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors relative border border-slate-700/50"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-all"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium hidden sm:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-800/50 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Premium Dark Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 mt-auto py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-base">TechNest</span>
            <span className="text-slate-600">|</span>
            <span>&copy; {new Date().getFullYear()} TechNest Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/products" className="hover:text-cyan-400 transition-colors">Catalog</Link>
            <Link to="/cart" className="hover:text-cyan-400 transition-colors">Cart</Link>
            <Link to="/profile" className="hover:text-cyan-400 transition-colors">Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
