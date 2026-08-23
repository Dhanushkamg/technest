import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/common/PaymentStatusBadge';
import { getProductImage } from '../../utils/productImages';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const numericOrderId = Number(orderId);

  const { data: order, isLoading, isError } = useOrderDetails(numericOrderId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto" />
        <div className="w-48 h-8 bg-slate-800 rounded mx-auto" />
        <div className="w-full h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">Could not retrieve order details for #{orderId}.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-colors"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Celebration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Order Confirmed!
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Thank you for shopping with TechNest. Your order has been placed and is currently being processed.
        </p>

        {/* Order Meta Bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 px-5 py-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <PackageCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Order #{order.id}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <span className="text-slate-700">|</span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
      </motion.div>

      {/* Order Details Grid */}
      <div className="space-y-6">
        {/* Shipping & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Delivery Address
            </h3>
            {order.deliveryAddress ? (
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white text-sm">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}</p>
                <p className="text-slate-500 font-mono pt-1">{order.deliveryAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard Delivery</p>
            )}
          </div>

          {/* Payment Status & Total */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Payment Info
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment Status:</span>
                <PaymentStatusBadge status="SUCCESS" size="sm" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-slate-300 font-semibold">Total Paid:</span>
                <span className="text-xl font-black text-white">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white mb-4">Items Ordered</h3>
          <div className="divide-y divide-slate-800/70">
            {order.items.map((item) => {
              const imgUrl = getProductImage({ id: item.productId, name: item.productName });
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/50 flex-shrink-0">
                      <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-sm line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white text-sm">
                    ${Number(item.subtotal || Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            to="/orders"
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm text-center shadow-lg shadow-cyan-500/25 transition-all"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="flex-1 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm text-center border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
