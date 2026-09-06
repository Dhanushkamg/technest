import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { User, Lock, ShoppingBag, Heart, Bell } from 'lucide-react';

const navItems = [
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/security', label: 'Security', icon: Lock },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

const AccountLayout: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white px-4">
              My Account
            </h2>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow min-w-0">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AccountLayout;
