import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  ChevronDown,
  Loader2,
  Tag,
  MapPin,
} from 'lucide-react';
import { useAdminOrders } from '../../hooks/admin/useAdminOrders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Order, OrderStatus } from '../../types';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const OrderRow: React.FC<{
  order: Order;
  onStatusChange: (vars: { id: number; status: OrderStatus }) => Promise<Order>;
  isUpdating: boolean;
}> = ({ order, onStatusChange, isUpdating }) => {
  const [expanded, setExpanded] = useState(false);
  const nextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <>
      <tr
        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400 font-mono">#{order.id}</td>
        <td className="px-6 py-4 text-slate-900 dark:text-slate-300 font-medium">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {order.deliveryAddress?.fullName || `User #${order.userId}`}
            </p>
            {order.deliveryAddress?.phoneNumber && (
              <p className="text-[11px] text-slate-400 font-mono">{order.deliveryAddress.phoneNumber}</p>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <OrderStatusBadge status={order.status} size="sm" />
        </td>
        <td className="px-6 py-4">
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
            {order.discountAmount > 0 && (
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Saved ${Number(order.discountAmount).toFixed(2)}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px]">
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {nextStatuses.length > 0 ? (
              <div className="flex gap-1.5 flex-wrap">
                {nextStatuses.map((nextStatus) => {
                  const colorMap: Record<string, string> = {
                    CONFIRMED:
                      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/60 dark:hover:bg-emerald-900/80',
                    SHIPPED:
                      'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100 dark:bg-brand-950/80 dark:text-brand-400 dark:border-brand-800/60 dark:hover:bg-brand-900/80',
                    DELIVERED:
                      'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border-indigo-800/60 dark:hover:bg-indigo-900/80',
                    CANCELLED:
                      'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/60 dark:hover:bg-rose-900/80',
                  };
                  return (
                    <button
                      key={nextStatus}
                      onClick={() => onStatusChange({ id: order.id, status: nextStatus })}
                      disabled={isUpdating}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all shadow-sm disabled:opacity-50 flex items-center gap-1 ${
                        colorMap[nextStatus] ||
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                      &rarr; {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">Finalized</span>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Order Detail Breakdown */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td
              colSpan={6}
              className="px-0 py-0 bg-slate-50/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800"
            >
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4 max-w-4xl">
                  {/* Order Items Table */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Purchased Items ({order.items.length})
                    </p>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                      {order.items.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            {item.productName}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {item.quantity} &times; ${Number(item.price).toFixed(2)}
                            <span className="ml-4 text-slate-900 dark:text-white font-bold">
                              ${Number(item.subtotal).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Financial Summary */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ${Number(order.subtotal).toFixed(2)}
                        </span>
                      </div>
                      {order.couponCode && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Tag className="w-3.5 h-3.5" /> Coupon ({order.couponCode}):
                          </span>
                          <span className="font-semibold">-${Number(order.discountAmount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                        <span>Total Paid:</span>
                        <span className="text-brand-600 dark:text-brand-400">
                          ${Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress ? (
                      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-500" /> Delivery Address
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {order.deliveryAddress.fullName} &bull; {order.deliveryAddress.phoneNumber}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {order.deliveryAddress.addressLine1}
                          {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {order.deliveryAddress.city}, {order.deliveryAddress.postalCode},{' '}
                          {order.deliveryAddress.country}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                        No delivery address recorded.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

export const AdminOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');

  const { orders, isLoading, isError, refetch, updateOrderStatus, isUpdatingStatus } = useAdminOrders(
    statusFilter === 'ALL' ? undefined : statusFilter,
    searchTerm || undefined
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        String(order.id).includes(searchTerm) ||
        (order.deliveryAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20 p-4">
        <ErrorState
          title="Failed to Load Orders"
          description="Could not retrieve order fulfillment list from admin server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-brand-500 dark:text-brand-400" /> Order Fulfillment Lifecycle
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track orders, validate state transitions, inspect deliveries, and handle cancellations
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order # or customer name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | OrderStatus)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-brand-500 outline-none font-medium"
          >
            <option value="ALL">All Order Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <EmptyState
                      title="No Orders Found"
                      description="No orders matched your search or status filter."
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={updateOrderStatus}
                    isUpdating={isUpdatingStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
