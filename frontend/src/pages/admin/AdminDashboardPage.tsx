import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCcw,
} from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Dashboard</h2>
        <p className="text-slate-400 text-sm mb-6">Could not retrieve admin analytics from the server.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Live business performance & order metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4 bg-gradient-to-r from-white to-cyan-300 bg-clip-text">
            ${Number(stats.totalRevenue || 0).toFixed(2)}
          </p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-400 mt-1">{stats.pendingOrders} pending fulfillment</p>
        </motion.div>

        {/* Total Products */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{stats.totalProducts}</p>
          <p className="text-[11px] text-amber-400 mt-1">{stats.lowStockProducts} low stock alerts</p>
        </motion.div>

        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4">{stats.totalUsers}</p>
          <p className="text-[11px] text-slate-400 mt-1">{stats.totalCategories} active categories</p>
        </motion.div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Order Status Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <span className="text-xs text-amber-400 block font-semibold">Pending</span>
            <span className="text-xl font-bold text-white">{stats.pendingOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-xs text-emerald-400 block font-semibold">Confirmed</span>
            <span className="text-xl font-bold text-white">{stats.confirmedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
            <span className="text-xs text-cyan-400 block font-semibold">Shipped</span>
            <span className="text-xl font-bold text-white">{stats.shippedOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
            <span className="text-xs text-indigo-400 block font-semibold">Delivered</span>
            <span className="text-xl font-bold text-white">{stats.deliveredOrders}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40">
            <span className="text-xs text-rose-400 block font-semibold">Cancelled</span>
            <span className="text-xl font-bold text-white">{stats.cancelledOrders}</span>
          </div>
        </div>
      </div>

      {/* Tables Section: Top Selling & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Top Selling Products
          </h3>

          {!stats.topSellingProducts || stats.topSellingProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No sales data recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-center">Units Sold</th>
                    <th className="pb-2 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.topSellingProducts.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200 line-clamp-1">{p.productName}</td>
                      <td className="py-2.5 text-center text-slate-300 font-bold">{p.totalQuantitySold}</td>
                      <td className="py-2.5 text-right text-cyan-400 font-bold">
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
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-400" /> Recent Orders
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          {!stats.recentOrders || stats.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No recent orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-2 font-semibold">Order</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recentOrders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-bold text-slate-200">#{o.id}</td>
                      <td className="py-2.5">
                        <OrderStatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="py-2.5 text-right font-bold text-white">
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
