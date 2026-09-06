import React from 'react';
import { Bell, Check, Package, CreditCard, Tag, Truck, RefreshCcw } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

const NotificationPage: React.FC = () => {
  const { notifications, isLoading, isError, markAsRead, markAllAsRead, isMarkingAllRead } = useNotifications();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
        return <Package size={24} className="text-blue-500" />;
      case 'PAYMENT_SUCCESS':
        return <CreditCard size={24} className="text-green-500" />;
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
        return <Truck size={24} className="text-primary" />;
      case 'PRICE_DROP':
      case 'PROMOTION':
        return <Tag size={24} className="text-pink-500" />;
      case 'ORDER_CANCELLED':
        return <RefreshCcw size={24} className="text-red-500" />;
      default:
        return <Bell size={24} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load notifications</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow max-w-4xl">
      <div className="p-6 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400">Stay updated with your orders and promotions.</p>
          </div>
        </div>
        
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
          <Bell size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm">We'll notify you when something important happens.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 sm:p-6 transition-colors flex gap-4 ${
                notification.isRead ? 'bg-transparent' : 'bg-blue-50/50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex-shrink-0 mt-1">{getIconForType(notification.type)}</div>
              <div className="flex-grow min-w-0">
                <p className={`text-gray-900 dark:text-gray-100 ${notification.isRead ? '' : 'font-semibold'}`}>
                  {notification.message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  title="Mark as read"
                  className="flex-shrink-0 self-start text-primary hover:text-primary-dark p-2"
                >
                  <span className="sr-only">Mark as read</span>
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
