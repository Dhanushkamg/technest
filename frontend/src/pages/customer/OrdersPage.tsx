import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, ArrowRight, ShoppingBag, Filter } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import type { OrderStatus } from '../../types';

type FilterStatus = 'ALL' | OrderStatus;

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError, refetch } = useOrders();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    return order.status === activeFilter;
  });

  // Loading Skeletons
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Unable to Load Orders"
          description="Failed to retrieve your order history from the server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and manage your order history and purchases</p>
        </div>
      </div>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {FILTER_OPTIONS.map((opt) => {
            const count = opt.value === 'ALL' ? orders.length : orders.filter((o) => o.status === opt.value).length;
            const isSelected = activeFilter === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description="You haven't placed any orders yet. Explore our product catalog to make your first purchase."
          action={{
            label: 'Explore Catalog',
            onClick: () => navigate('/products'),
            icon: <ShoppingBag className="w-4 h-4" />,
          }}
        />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8">
          <Filter className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No {activeFilter.toLowerCase()} orders</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            You do not have any orders matching the "{activeFilter}" status filter.
          </p>
          <button
            onClick={() => setActiveFilter('ALL')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Show All Orders
          </button>
        </div>
      ) : (
        // Order List
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const itemCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 hover:border-brand-300 dark:hover:border-brand-500/50 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md dark:shadow-none transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        Order #{order.id}
                      </span>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    </div>

                    {/* Preview of item names */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {order.items?.map((i) => i.productName).join(', ')}
                    </p>
                  </div>

                  {/* Right: Total Amount & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">Total Amount</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                      className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 text-slate-500 dark:text-slate-300 group-hover:text-white transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
