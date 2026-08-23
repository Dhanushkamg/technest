import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import type { PaymentStatus } from '../../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (status) {
    case 'SUCCESS':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 ${sizeClasses}`}>
          <CheckCircle2 className={iconSize} /> Paid
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 ${sizeClasses}`}>
          <CreditCard className={iconSize} /> Payment Pending
        </span>
      );
    case 'FAILED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 ${sizeClasses}`}>
          <AlertTriangle className={iconSize} /> Payment Failed
        </span>
      );
    case 'REFUNDED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-950/80 text-purple-400 border border-purple-800/60 ${sizeClasses}`}>
          <RotateCcw className={iconSize} /> Refunded
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

export default PaymentStatusBadge;
