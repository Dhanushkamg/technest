import React from 'react';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';
import type { OrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (status) {
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 ${sizeClasses}`}>
          <Clock className={iconSize} /> Pending
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 ${sizeClasses}`}>
          <CheckCircle2 className={iconSize} /> Confirmed
        </span>
      );
    case 'SHIPPED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 ${sizeClasses}`}>
          <Truck className={iconSize} /> Shipped
        </span>
      );
    case 'DELIVERED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 ${sizeClasses}`}>
          <PackageCheck className={iconSize} /> Delivered
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 ${sizeClasses}`}>
          <XCircle className={iconSize} /> Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export default OrderStatusBadge;
