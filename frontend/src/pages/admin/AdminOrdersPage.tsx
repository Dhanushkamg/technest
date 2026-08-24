import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  ChevronDown,
  AlertTriangle,
  RefreshCcw,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useAdminOrders } from '../../hooks/admin/useAdminOrders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
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
        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="px-6 py-4 font-bold text-cyan-400 font-mono">#{order.id}</td>
        <td className="px-6 py-4 text-slate-300 font-medium">
          {order.deliveryAddress?.fullName || `User #${order.userId}`}
        </td>
        <td className="px-6 py-4">
          <OrderStatusBadge status={order.status} size="sm" />
        </td>
        <td className="px-6 py-4 font-bold text-white">${Number(order.totalAmount).toFixed(2)}</td>
        <td className="px-6 py-4 text-slate-400 text-[11px]">
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {nextStatuses.length > 0 ? (
              <div className="flex gap-1.5 flex-wrap">
                {nextStatuses.map((nextStatus) => {
                  const colorMap: Record<string, string> = {
                    CONFIRMED: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/80',
                    SHIPPED: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60 hover:bg-cyan-900/80',
                    DELIVERED: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60 hover:bg-indigo-900/80',
                    CANCELLED: 'bg-rose-950/80 text-rose-400 border-rose-800/60 hover:bg-rose-900/80',
                  };
                  return (
                    <button
                      key={nextStatus}
                      onClick={() => onStatusChange({ id: order.id, status: nextStatus })}
                      disabled={isUpdating}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors disabled:opacity-50 flex items-center gap-1 ${colorMap[nextStatus] || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                    >
                      {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                      → {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-slate-600 text-[11px] italic">No transitions available</span>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Order Items */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={6} className="px-0 py-0 bg-slate-950/60 border-b border-slate-800">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-10 py-4 space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Items</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-medium">{item.productName}</span>
                        <span className="text-slate-400">
                          {item.quantity} × ${Number(item.price).toFixed(2)}
                          <span className="ml-3 text-white font-bold">${Number(item.subtotal).toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  {order.deliveryAddress && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Delivery: </span>
                      {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city},{' '}
                      {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                    </div>
                  )}
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
  const { orders, isLoading, isError, refetch, updateOrderStatus, isUpdatingStatus } = useAdminOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        String(order.id).includes(searchTerm) ||
        (order.deliveryAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-slate-800 rounded mb-4" />
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Orders</h2>
        <p className="text-slate-400 text-sm mb-6">Could not retrieve order list from server.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm"
        >
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-cyan-400" /> Order Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          View and update order fulfillment status — {orders.length} total orders
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | OrderStatus)}
            className="appearance-none pr-9 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <XCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No orders match the current filter.</p>
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
