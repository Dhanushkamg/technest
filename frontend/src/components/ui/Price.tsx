import React from 'react';

export interface PriceProps {
  amount: number | string;
  originalAmount?: number | string | null;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: { current: 'text-sm font-bold', original: 'text-xs', badge: 'text-[10px] px-1.5 py-0.2' },
  md: { current: 'text-lg font-bold', original: 'text-xs', badge: 'text-xs px-1.5 py-0.5' },
  lg: { current: 'text-2xl font-black tracking-tight', original: 'text-sm', badge: 'text-xs px-2 py-0.5' },
  xl: { current: 'text-3xl sm:text-4xl font-black tracking-tight', original: 'text-base', badge: 'text-xs px-2 py-1' },
};

export const Price: React.FC<PriceProps> = ({
  amount,
  originalAmount,
  currency = '$',
  size = 'md',
  className = '',
}) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const numericOriginal = originalAmount ? (typeof originalAmount === 'string' ? parseFloat(originalAmount) || 0 : originalAmount) : null;

  const hasDiscount = numericOriginal !== null && numericOriginal > numericAmount;
  const discountPercent = hasDiscount
    ? Math.round(((numericOriginal - numericAmount) / numericOriginal) * 100)
    : 0;

  const styles = sizeStyles[size];

  return (
    <div className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={`${styles.current} text-slate-900 dark:text-white`}>
        {currency}
        {numericAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>

      {hasDiscount && (
        <>
          <span className={`${styles.original} text-slate-400 line-through font-normal`}>
            {currency}
            {numericOriginal?.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className={`${styles.badge} font-bold rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60`}>
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
};
