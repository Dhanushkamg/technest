import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  XCircle,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import { useOrders } from '../../hooks/useOrders';
import { usePayment } from '../../hooks/usePayment';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/common/PaymentStatusBadge';
import { getProductImage } from '../../utils/productImages';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

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
    } catch (err: unknown) {
      const msg =
        (axios.isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined) ||
        (err instanceof Error ? err.message : 'Failed to cancel order.');
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="h-48 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Order Not Found"
          description={`Could not retrieve order details for #${id}.`}
          action={
            <Link to="/orders">
              <Button variant="primary">Back to Orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Orders History
      </Link>

      {/* Header Info Banner */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Order #{order.id}</h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={paymentStatus} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Order Progress Timeline */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Order Progress</h2>
        {order.status === 'CANCELLED' ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <div>
              <p className="font-bold">This order has been cancelled.</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">Inventory has been restored.</p>
            </div>
          </div>
        ) : (
          (() => {
            const steps = [
              { key: 'PENDING', label: 'Order Placed' },
              { key: 'CONFIRMED', label: 'Confirmed & Processing' },
              { key: 'SHIPPED', label: 'Shipped' },
              { key: 'DELIVERED', label: 'Delivered' },
            ];
            const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
            const currentIndex = statusOrder.indexOf(order.status);

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {steps.map((step, idx) => {
                  const isCompleted = currentIndex >= idx;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100 dark:ring-emerald-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-brand-600 dark:text-brand-400'
                            : isCompleted
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item List */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Order Items ({order.items.length})
            </h3>

            <div className="divide-y divide-slate-200 dark:divide-slate-800/70">
              {order.items.map((item) => {
                const imgUrl = getProductImage({ id: item.productId, name: item.productName });
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700/50 flex-shrink-0">
                        <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 text-sm line-clamp-1 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Unit Price: ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      ${Number(item.subtotal || Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Shipping Destination
            </h3>
            {order.deliveryAddress ? (
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                </p>
                <p className="text-slate-400 font-mono pt-1">{order.deliveryAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard Delivery</p>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold">${Number(order.subtotal || order.totalAmount).toFixed(2)}</span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-${Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white font-bold text-base">Total Amount</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <ConfirmDialog
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title={`Cancel Order #${order.id}?`}
        description="Are you sure you want to cancel this order? Product stock will be returned."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep Order"
        confirmVariant="danger"
        isLoading={isCancellingOrder}
      />
    </div>
  );
};

export default OrderDetailPage;
