import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="max-w-md mx-auto py-20">
        <ErrorState
          title="Failed to Load Dashboard"
          description="Could not retrieve admin analytics from the server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live business performance & order metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900/80 border border-brand-200 dark:border-brand-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-4">
            ${Number(stats.totalRevenue || 0).toFixed(2)}
          </p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-4">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{stats.pendingOrders} pending fulfillment</p>
        </motion.div>

        {/* Total Products */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-4">{stats.totalProducts}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">{stats.lowStockProducts} low stock alerts</p>
        </motion.div>

        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-4">{stats.totalUsers}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{stats.totalCategories} active categories</p>
        </motion.div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Order Status Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
            <span className="text-xs text-amber-700 dark:text-amber-400 block font-semibold">Pending</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-semibold">Confirmed</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.confirmedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/40">
            <span className="text-xs text-brand-700 dark:text-brand-400 block font-semibold">Shipped</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.shippedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
            <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-semibold">Delivered</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.deliveredOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/30 border border-red-200 dark:border-rose-800/40">
            <span className="text-xs text-red-700 dark:text-rose-400 block font-semibold">Cancelled</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.cancelledOrders}</span>
          </div>
        </div>
      </div>

      {/* Tables Section: Top Selling & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Top Selling Products
          </h3>

          {!stats.topSellingProducts || stats.topSellingProducts.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No sales data recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-center">Units Sold</th>
                    <th className="pb-2 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {stats.topSellingProducts.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{p.productName}</td>
                      <td className="py-2.5 text-center text-slate-600 dark:text-slate-300 font-bold">{p.totalQuantitySold}</td>
                      <td className="py-2.5 text-right text-brand-600 dark:text-brand-400 font-bold">
                        ${Number(p.totalRevenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Recent Orders
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          {!stats.recentOrders || stats.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No recent orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-2 font-semibold">Order</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {stats.recentOrders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-bold text-slate-700 dark:text-slate-200">#{o.id}</td>
                      <td className="py-2.5">
                        <OrderStatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        ${Number(o.totalAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
