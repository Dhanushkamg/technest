import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCcw,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import type { NotificationType } from '../../types';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'ORDER_STATUS_UPDATED':
        return <PackageCheck className="w-4 h-4 text-cyan-400" />;
      case 'PAYMENT_SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'PAYMENT_FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'ORDER_CANCELLED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'REFUND_PROCESSED':
        return <RefreshCcw className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleNotificationClick = async (id: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors relative border border-slate-700/50 cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 border border-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllRead}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Mark all as read
                </button>
              )}
            </div>

            {/* List Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item.id, item.isRead)}
                    className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                      item.isRead
                        ? 'hover:bg-slate-800/30 opacity-75'
                        : 'bg-slate-800/40 hover:bg-slate-800/70 border-l-2 border-cyan-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(item.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
