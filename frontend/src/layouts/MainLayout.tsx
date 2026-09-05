import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Cpu, LogOut, ShieldAlert, Package, ChevronDown, Menu } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { MiniCart } from '../components/cart/MiniCart';
import { NotificationDropdown } from '../components/notification/NotificationDropdown';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { IconButton } from '../components/ui/IconButton';
import { Drawer } from '../components/ui/Drawer';
import { Button } from '../components/ui/Button';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemCount = useCartStore((state) => state.cartItemCount);
  const isMiniCartOpen = useCartStore((state) => state.isMiniCartOpen);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const closeMiniCart = useCartStore((state) => state.closeMiniCart);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    toast.success('Successfully logged out.');
    navigate('/');
  };

  const navLinks = (
    <>
      <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">Home</Link>
      <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">Products</Link>
      {isAdmin && (
        <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-semibold">
          <ShieldAlert className="w-4 h-4" />
          Admin Panel
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white font-sans antialiased transition-colors duration-200">
      <Toaster position="top-right" richColors closeButton theme="system" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <IconButton
                icon={<Menu className="w-5 h-5" />}
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                className="text-slate-600 dark:text-slate-300"
              />
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-slate-600 to-brand-600 dark:from-white dark:via-slate-200 dark:to-brand-400 bg-clip-text text-transparent">
                Tech<span className="text-brand-500 dark:text-brand-400">Nest</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 dark:text-slate-300">
            {navLinks}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Link 
              to="/wishlist" 
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors relative border border-transparent dark:border-slate-700/50 hidden sm:flex"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <button
              onClick={() => openMiniCart()}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative border border-transparent dark:border-slate-700/50 flex items-center justify-center"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 dark:bg-brand-500 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-400/30 flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Account Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors"
                    >
                      <User className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Profile & Addresses
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors"
                    >
                      <Package className="w-4 h-4 text-brand-500 dark:text-brand-400" /> My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Saved Items
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-sm font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 text-sm font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="left"
        size="sm"
        title="Menu"
        contentClassName="p-0 flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200">Home</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200">Products</Link>
            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          <hr className="border-slate-200 dark:border-slate-800" />

          {isAuthenticated ? (
            <nav className="flex flex-col gap-2">
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-500" /> Profile
              </Link>
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-500" /> Orders
              </Link>
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> Wishlist
              </Link>
              <button onClick={handleLogout} className="px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-rose-950/30 transition-colors font-medium text-red-600 dark:text-rose-400 flex items-center gap-2 text-left w-full">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Button variant="outline" className="w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>
                Sign In
              </Button>
              <Button variant="primary" className="w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}>
                Register
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</span>
          <ThemeToggle />
        </div>
      </Drawer>

      {/* Mini Cart Drawer */}
      <MiniCart isOpen={isMiniCartOpen} onClose={closeMiniCart} />

      {/* Dynamic Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 mt-auto py-12 text-slate-500 dark:text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            <span className="font-bold text-slate-900 dark:text-white text-base">TechNest</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>&copy; {new Date().getFullYear()} TechNest Inc. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-slate-500 dark:text-slate-400">
            <Link to="/products" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Catalog</Link>
            <Link to="/cart" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Cart</Link>
            <Link to="/profile" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
