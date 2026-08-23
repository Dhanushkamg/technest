import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  XCircle,
  AlertTriangle,
  Loader2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import { useOrders } from '../../hooks/useOrders';
import { usePayment } from '../../hooks/usePayment';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/common/PaymentStatusBadge';
import { getProductImage } from '../../utils/productImages';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data: order, isLoading, isError, refetch } = useOrderDetails(numericId);
  const { payments = [] } = usePayment(numericId);
  const { cancelOrder, isCancellingOrder } = useOrders();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const paymentStatus = payments.length > 0 ? payments[0].status : order?.status === 'CONFIRMED' ? 'SUCCESS' : 'PENDING';

  const handleConfirmCancel = async () => {
    if (!order) return;
    try {
      await cancelOrder(order.id);
      toast.success(`Order #${order.id} has been cancelled.`);
      setShowCancelModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="w-32 h-6 bg-slate-800 rounded mb-8" />
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
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
        <p className="text-slate-400 text-sm mb-6">Could not retrieve order details for #{id}.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Orders History
      </Link>

      {/* Header Info Banner */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Order #{order.id}</h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={paymentStatus} />
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold text-xs border border-rose-800/50 transition-colors"
          >
            <XCircle className="w-4 h-4" /> Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item List */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" /> Order Items ({order.items.length})
            </h3>

            <div className="divide-y divide-slate-800/70">
              {order.items.map((item) => {
                const imgUrl = getProductImage({ id: item.productId, name: item.productName });
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/50 flex-shrink-0">
                        <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-slate-100 hover:text-cyan-400 text-sm line-clamp-1 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">
                          Unit Price: ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-white text-base">
                      ${Number(item.subtotal || Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" /> Shipping Destination
            </h3>
            {order.deliveryAddress ? (
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white text-sm">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                </p>
                <p className="text-slate-500 font-mono pt-1">{order.deliveryAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard Delivery</p>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-lg font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" /> Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold">${Number(order.subtotal || order.totalAmount).toFixed(2)}</span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-cyan-400 font-semibold">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-${Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-slate-800">
              <span className="text-white font-bold text-base">Total Amount</span>
              <span className="text-2xl font-black text-white">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancel Order #{order.id}?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to cancel this order? Product stock will be returned.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancellingOrder}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  No, Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancellingOrder}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isCancellingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetailPage;
