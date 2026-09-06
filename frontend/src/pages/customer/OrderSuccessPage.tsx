import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import { usePayment } from '../../hooks/usePayment';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/common/PaymentStatusBadge';
import { getProductImage } from '../../utils/productImages';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const numericOrderId = Number(orderId);

  const { data: order, isLoading, isError, refetch: refetchOrder } = useOrderDetails(numericOrderId);
  const { payments, refetch: refetchPayments } = usePayment(numericOrderId);

  const [pollCount, setPollCount] = useState(0);
  const isTimedOut = pollCount >= 12;

  const latestPayment = payments && payments.length > 0 ? payments[payments.length - 1] : null;
  const isPayHere = latestPayment?.paymentMethod === 'PAYHERE';
  const paymentStatus = latestPayment
    ? latestPayment.status
    : (order && (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED'))
    ? 'SUCCESS'
    : 'PENDING';

  // Polling for PayHere pending transactions: 5s interval, max 12 attempts (60s total)
  useEffect(() => {
    if (!isPayHere || paymentStatus !== 'PENDING' || order?.status !== 'PENDING' || pollCount >= 12) {
      return;
    }

    const intervalId = setInterval(() => {
      refetchPayments();
      refetchOrder();
      setPollCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPayHere, paymentStatus, order?.status, pollCount, refetchPayments, refetchOrder]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
        <div className="w-full h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Order Not Found"
          description={`Could not retrieve order details for #${orderId}.`}
          action={
            <Link to="/orders">
              <Button variant="primary">View My Orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-md dark:shadow-2xl text-center mb-8 relative overflow-hidden"
      >
        {paymentStatus === 'FAILED' ? (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10 dark:shadow-rose-500/20">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Payment Failed
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              Your payment transaction could not be completed. Please review your order or attempt payment again.
            </p>
          </>
        ) : isPayHere && paymentStatus === 'PENDING' && !isTimedOut ? (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10 dark:shadow-amber-500/20">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Awaiting Payment Confirmation
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              Your PayHere transaction was submitted. We are waiting for the payment gateway webhook to confirm your transaction (Checking status automatically...).
            </p>
          </>
        ) : isPayHere && paymentStatus === 'PENDING' && isTimedOut ? (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10 dark:shadow-amber-500/20">
              <Clock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Payment Confirmation Pending
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              Your order has been recorded. The gateway confirmation is taking a little longer than usual. You can check your order status later on your orders page.
            </p>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Order Confirmed!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              Thank you for shopping with TechNest. Your order has been placed and is currently being processed.
            </p>
          </>
        )}

        {/* Order Meta Bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <PackageCheck className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <span className="font-bold text-slate-900 dark:text-white">Order #{order.id}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
      </motion.div>

      {/* Order Details Grid */}
      <div className="space-y-6">
        {/* Shipping & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Delivery Address
            </h3>
            {order.deliveryAddress ? (
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}</p>
                <p className="text-slate-400 font-mono pt-1">{order.deliveryAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-500">Standard Delivery</p>
            )}
          </div>

          {/* Payment Status & Total */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Payment Info
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                <PaymentStatusBadge status={paymentStatus} size="sm" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Paid:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Items Ordered</h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-800/70">
            {order.items.map((item) => {
              const imgUrl = getProductImage({ id: item.productId, name: item.productName });
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700/50 flex-shrink-0">
                      <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    ${Number(item.subtotal || Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/orders" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              View My Orders
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" size="lg" className="w-full" leftIcon={<ShoppingBag className="w-4 h-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
