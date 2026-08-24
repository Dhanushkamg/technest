import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Loader2 } from 'lucide-react';
import type { Coupon, CreateCouponRequest, DiscountType } from '../../types';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponRequest) => Promise<void>;
  coupon?: Coupon | null;
  isLoading: boolean;
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  coupon,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateCouponRequest>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxUsageLimit: 100,
    minOrderAmount: 0,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUsageLimit: coupon.maxUsageLimit || undefined,
        minOrderAmount: coupon.minOrderAmount || undefined,
      });
    } else {
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxUsageLimit: 100,
        minOrderAmount: 0,
      });
    }
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-400" />
                {coupon ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 focus:border-cyan-500 outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Max Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUsageLimit || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsageLimit: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Min Order Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderAmount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.code.trim() || formData.discountValue <= 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {coupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CouponFormModal;
