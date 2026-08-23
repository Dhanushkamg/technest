import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, ArrowRight, RefreshCcw, AlertTriangle, ShoppingBag } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError, refetch } = useOrders();

  // Loading Skeletons
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="w-48 h-8 bg-slate-800 rounded mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Orders</h2>
        <p className="text-slate-400 text-sm mb-6">Failed to retrieve your order history from the server.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Orders</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage your order history and purchases</p>
        </div>
      </div>

      {orders.length === 0 ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 text-slate-500">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Orders Found</h2>
          <p className="text-slate-400 text-sm max-w-sm mb-8">
            You haven't placed any orders yet. Explore our product catalog to make your first purchase.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> Explore Catalog
          </Link>
        </motion.div>
      ) : (
        // Order List
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-cyan-500/10 transition-all backdrop-blur-xl group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
                        Order #{order.id}
                      </span>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    </div>

                    {/* Preview of item names */}
                    <p className="text-xs text-slate-300 line-clamp-1">
                      {order.items?.map((i) => i.productName).join(', ')}
                    </p>
                  </div>

                  {/* Right: Total Amount & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-500 block">Total Amount</span>
                      <span className="text-xl font-black text-white bg-gradient-to-r from-white to-cyan-300 bg-clip-text">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                      className="p-3 rounded-xl bg-slate-800 group-hover:bg-cyan-500 text-slate-300 group-hover:text-white transition-colors"
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
