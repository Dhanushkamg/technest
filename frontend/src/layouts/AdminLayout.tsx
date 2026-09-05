import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  ArrowLeft,
  Cpu,
  ShieldCheck,
  LogOut,
  Menu,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Drawer } from '../components/ui/Drawer';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Categories', path: '/admin/categories', icon: Layers },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', path: '/admin/coupons', icon: Tag },
];

const SidebarContent: React.FC<{ onNavClick?: () => void; onLogout: () => void }> = ({ onNavClick, onLogout }) => (
  <>
    <nav className="p-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-1 mt-auto">
      <Link
        to="/"
        onClick={onNavClick}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Storefront
      </Link>

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 text-sm font-medium transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </div>
  </>
);

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); setMobileSidebarOpen(false); };
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
      <Toaster position="top-right" richColors closeButton theme="system" />

      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 flex-col flex-shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Admin Header / Logo */}
        <div className="h-16 lg:h-20 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-lg bg-gradient-to-r from-slate-800 to-brand-600 dark:from-white dark:to-brand-400 bg-clip-text text-transparent">
              TechNest
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <SidebarContent onLogout={handleLogout} />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        position="left"
        size="sm"
        title={
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-500" />
            <span className="font-bold">TechNest Admin</span>
          </div>
        }
        contentClassName="p-0 flex flex-col h-full"
      >
        <SidebarContent onNavClick={closeMobileSidebar} onLogout={handleLogout} />
      </Drawer>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 lg:h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile: Hamburger + Title */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100">Control Center</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 border border-brand-200 dark:border-brand-500/40 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">{user?.name || 'Administrator'}</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
