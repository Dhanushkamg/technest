import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdjustStockMutation } from '../../hooks/admin/useAdminInventory';
import type { Product, MovementType } from '../../types';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ isOpen, onClose, product }) => {
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [movementType, setMovementType] = useState<MovementType>('RESTOCK');
  const [reason, setReason] = useState<string>('');

  const adjustStockMutation = useAdjustStockMutation();

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityChange === 0) {
      toast.error('Adjustment quantity cannot be zero');
      return;
    }

    const calculatedNewStock = product.stock + quantityChange;
    if (calculatedNewStock < 0) {
      toast.error(`Adjustment would result in negative stock (${calculatedNewStock})`);
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        productId: product.id,
        quantityChange,
        movementType,
        reason: reason.trim() || undefined,
      });
      toast.success(`Stock adjusted successfully for ${product.name}`);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const calculatedNewStock = product.stock + quantityChange;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-500" /> Adjust Stock: {product.name}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Current Stock:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{product.stock} units</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Movement Type
              </label>
              <select
                value={movementType}
                onChange={(e) => {
                  const type = e.target.value as MovementType;
                  setMovementType(type);
                  if (type === 'DAMAGE') {
                    setQuantityChange((prev) => (prev > 0 ? -prev : prev));
                  } else if (type === 'RESTOCK' || type === 'PURCHASE') {
                    setQuantityChange((prev) => (prev < 0 ? -prev : prev));
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="RESTOCK">RESTOCK (Adding stock)</option>
                <option value="DAMAGE">DAMAGE (Damaged / written off goods)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audit correction)</option>
                <option value="PURCHASE">PURCHASE (New inventory purchase)</option>
                <option value="RETURN">RETURN (Customer return)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Change (+ or -)
              </label>
              <input
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                placeholder="e.g. +10 or -3"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Projected New Stock: <strong className={calculatedNewStock < 0 ? 'text-red-500' : 'text-emerald-500'}>{calculatedNewStock}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Received shipment #4892"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {calculatedNewStock < 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Resulting stock cannot be negative. Please adjust the quantity.</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustStockMutation.isPending || calculatedNewStock < 0 || quantityChange === 0}
                className="px-4 py-2 text-xs rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold transition shadow-sm"
              >
                {adjustStockMutation.isPending ? 'Saving...' : 'Apply Stock Movement'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StockAdjustModal;
