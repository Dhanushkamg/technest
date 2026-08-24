import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Cpu, LogOut, ShieldAlert, Package, ChevronDown } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { MiniCart } from '../components/cart/MiniCart';
import { NotificationDropdown } from '../components/notification/NotificationDropdown';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.cartItemCount);
  const isMiniCartOpen = useCartStore((state) => state.isMiniCartOpen);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const closeMiniCart = useCartStore((state) => state.closeMiniCart);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN';

  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    // Reset cart & notification state and query cache so no stale data is shown for the next user
    useCartStore.getState().clearCart();
    useCartStore.getState().closeMiniCart();
    queryClient.removeQueries({ queryKey: ['cart'] });
    queryClient.removeQueries({ queryKey: ['notifications'] });
    setIsDropdownOpen(false);
    toast.success('Successfully logged out.');
    navigate('/');
  };

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

            <button
              onClick={() => openMiniCart()}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors relative border border-slate-700/50"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Account Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors"
                    >
                      <User className="w-4 h-4 text-cyan-400" /> Profile & Addresses
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors"
                    >
                      <Package className="w-4 h-4 text-cyan-400" /> My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-400" /> Saved Items
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-950/30 text-sm font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-800/80 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 text-sm font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Mini Cart Drawer */}
      <MiniCart isOpen={isMiniCartOpen} onClose={closeMiniCart} />

      {/* Dynamic Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
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
