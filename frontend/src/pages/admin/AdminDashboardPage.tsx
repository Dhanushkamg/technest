import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Layers,
  Calendar,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Box,
} from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import type { DashboardDateRange } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<DashboardDateRange>('LAST_30_DAYS');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'revenue' | 'orders'>('revenue');

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAdminDashboard(
    selectedRange,
    selectedRange === 'CUSTOM' ? customStart : undefined,
    selectedRange === 'CUSTOM' ? customEnd : undefined
  );

  const rangeButtons: { label: string; value: DashboardDateRange }[] = [
    { label: 'Today', value: 'TODAY' },
    { label: '7D', value: 'LAST_7_DAYS' },
    { label: '30D', value: 'LAST_30_DAYS' },
    { label: '3M', value: 'LAST_3_MONTHS' },
    { label: '1Y', value: 'LAST_1_YEAR' },
    { label: 'Custom', value: 'CUSTOM' },
  ];

  const handleRangeChange = (range: DashboardDateRange) => {
    setSelectedRange(range);
    if (range === 'CUSTOM') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <ErrorState
          title="Failed to Load Dashboard"
          description="Could not retrieve real server-side analytics."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Calculate timeline max for responsive SVG chart heights
  const timeline = stats.revenueTimeline || [];
  const maxTimelineRevenue = Math.max(...timeline.map((t) => Number(t.revenue || 0)), 10);
  const maxTimelineOrders = Math.max(...timeline.map((t) => Number(t.orderCount || 0)), 1);

  return (
    <div className="space-y-6 sm:space-y-8 p-2 sm:p-6 max-w-7xl mx-auto">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Executive Analytics
            {isFetching && <RefreshCw className="w-4 h-4 text-brand-500 animate-spin" />}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time server analytics aggregated for {stats.dateFilter || selectedRange}
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner">
          {rangeButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => handleRangeChange(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRange === btn.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker Accordion */}
      {showCustomPicker && selectedRange === 'CUSTOM' && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCustomApply}
          className="p-4 bg-white dark:bg-slate-900/90 border border-brand-200 dark:border-brand-500/30 rounded-2xl shadow-sm flex flex-wrap items-end gap-4"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Start Date
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> End Date
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Apply Filter
          </button>
        </motion.form>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900/80 border border-brand-200 dark:border-brand-500/30 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            ${Number(stats.totalRevenue || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Excludes cancelled orders</p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.totalOrders}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            {stats.pendingOrders} pending fulfillment
          </p>
        </motion.div>

        {/* Catalog & Inventory Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm cursor-pointer hover:border-brand-500/40 transition"
          onClick={() => navigate('/admin/products')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Products</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.totalProducts}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> {stats.lowStockProducts} Low
            </span>
            <span className="text-[11px] text-red-600 dark:text-rose-400 font-medium flex items-center gap-0.5">
              <Box className="w-3 h-3" /> {stats.outOfStockProducts || 0} Out
            </span>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customers</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.totalUsers}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{stats.totalCategories} active categories</p>
        </motion.div>
      </div>

      {/* Interactive Timeline Chart Section */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              {activeTab === 'revenue' ? 'Revenue Timeline' : 'Order Volume Timeline'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Daily metrics across the active date range
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'revenue'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Order Volume
            </button>
          </div>
        </div>

        {timeline.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            No data recorded for this time range.
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-44 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-2">
              {timeline.map((point) => {
                const val = activeTab === 'revenue' ? Number(point.revenue) : point.orderCount;
                const max = activeTab === 'revenue' ? maxTimelineRevenue : maxTimelineOrders;
                const heightPct = Math.max((val / max) * 100, 4);

                return (
                  <div key={point.date} className="flex-1 min-w-[20px] sm:min-w-[28px] flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg shadow-lg z-20 pointer-events-none whitespace-nowrap">
                      <span className="font-semibold">{point.date}</span>
                      <span>
                        {activeTab === 'revenue' ? `$${Number(point.revenue).toFixed(2)}` : `${point.orderCount} orders`}
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.4 }}
                        className={`w-full rounded-t-lg transition-colors ${
                          activeTab === 'revenue'
                            ? 'bg-gradient-to-t from-brand-600 to-brand-400 group-hover:from-brand-500 group-hover:to-brand-300'
                            : 'bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300'
                        }`}
                      />
                    </div>
                    {/* Date label */}
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 truncate max-w-full">
                      {point.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Order Status Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div
            onClick={() => navigate('/admin/orders?status=PENDING')}
            className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 cursor-pointer hover:scale-[1.02] transition"
          >
            <span className="text-xs text-amber-700 dark:text-amber-400 block font-semibold">Pending</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</span>
          </div>
          <div
            onClick={() => navigate('/admin/orders?status=CONFIRMED')}
            className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 cursor-pointer hover:scale-[1.02] transition"
          >
            <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-semibold">Confirmed</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.confirmedOrders}</span>
          </div>
          <div
            onClick={() => navigate('/admin/orders?status=SHIPPED')}
            className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/40 cursor-pointer hover:scale-[1.02] transition"
          >
            <span className="text-xs text-brand-700 dark:text-brand-400 block font-semibold">Shipped</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.shippedOrders}</span>
          </div>
          <div
            onClick={() => navigate('/admin/orders?status=DELIVERED')}
            className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 cursor-pointer hover:scale-[1.02] transition"
          >
            <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-semibold">Delivered</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.deliveredOrders}</span>
          </div>
          <div
            onClick={() => navigate('/admin/orders?status=CANCELLED')}
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 cursor-pointer hover:scale-[1.02] transition"
          >
            <span className="text-xs text-rose-700 dark:text-rose-400 block font-semibold">Cancelled</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.cancelledOrders}</span>
          </div>
        </div>
      </div>

      {/* Breakdown: Top Selling Products & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Top Selling Products
            </h3>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
            >
              Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!stats.topSellingProducts || stats.topSellingProducts.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No sales recorded in this period.</p>
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
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{p.productName}</td>
                      <td className="py-2.5 text-center text-slate-600 dark:text-slate-300 font-bold">{p.totalQuantitySold}</td>
                      <td className="py-2.5 text-right text-brand-600 dark:text-brand-400 font-bold">
                        ${Number(p.totalRevenue || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Categories Breakdown */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Top Categories
            </h3>
            <button
              onClick={() => navigate('/admin/categories')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
            >
              Categories <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!stats.topCategories || stats.topCategories.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No category sales recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-2 font-semibold">Category</th>
                    <th className="pb-2 font-semibold text-center">Units Sold</th>
                    <th className="pb-2 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {stats.topCategories.map((c) => (
                    <tr key={c.categoryId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{c.categoryName}</td>
                      <td className="py-2.5 text-center text-slate-600 dark:text-slate-300 font-bold">{c.totalQuantitySold}</td>
                      <td className="py-2.5 text-right text-brand-600 dark:text-brand-400 font-bold">
                        ${Number(c.totalRevenue || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Recent Orders
          </h3>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            View All Orders
          </button>
        </div>

        {!stats.recentOrders || stats.recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-2.5 font-semibold">Order</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats.recentOrders.slice(0, 5).map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate('/admin/orders')}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">#{o.id}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
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
  );
};

export default AdminDashboardPage;
