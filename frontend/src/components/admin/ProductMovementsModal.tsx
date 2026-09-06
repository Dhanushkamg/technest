import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ArrowUpRight, ArrowDownRight, RefreshCw, User, Calendar } from 'lucide-react';
import { useAdminProductMovements } from '../../hooks/admin/useAdminInventory';
import type { Product, MovementType } from '../../types';

interface ProductMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductMovementsModal: React.FC<ProductMovementsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { data: movements, isLoading, isError, refetch } = useAdminProductMovements(
    product ? product.id : null
  );

  if (!isOpen || !product) return null;

  const getMovementBadge = (type: MovementType, qty: number) => {
    switch (type) {
      case 'RESTOCK':
      case 'PURCHASE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/40">
            <ArrowUpRight className="w-3 h-3" /> {type} (+{qty})
          </span>
        );
      case 'DAMAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/40">
            <ArrowDownRight className="w-3 h-3" /> {type} ({qty})
          </span>
        );
      case 'SALE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/40">
            <ArrowDownRight className="w-3 h-3" /> SALE ({qty})
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/40">
            <ArrowUpRight className="w-3 h-3" /> RETURN (+{qty})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            {type} ({qty > 0 ? `+${qty}` : qty})
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Inventory Movement Audit
                </h2>
                <p className="text-[11px] text-slate-400">{product.name} (Current Stock: {product.stock})</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-3">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                <span className="text-xs">Loading audit records...</span>
              </div>
            ) : isError ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl text-xs text-center">
                Failed to load movement history.{' '}
                <button onClick={() => refetch()} className="underline font-bold">
                  Retry
                </button>
              </div>
            ) : !movements || movements.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No inventory movement records found for this product yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {movements.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getMovementBadge(m.movementType, m.quantityChange)}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {m.oldStock} &rarr; {m.newStock} units
                        </span>
                      </div>
                      {m.reason && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                          &ldquo;{m.reason}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="text-right space-y-0.5 sm:self-center flex-shrink-0">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 sm:justify-end">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                      {m.responsibleUserEmail && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 sm:justify-end font-mono">
                          <User className="w-3 h-3" />
                          {m.responsibleUserEmail}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductMovementsModal;
