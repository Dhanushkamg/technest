import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  RefreshCcw,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useAdminCoupons } from '../../hooks/admin/useAdminCoupons';
import CouponFormModal from '../../components/admin/CouponFormModal';
import type { Coupon, CreateCouponRequest } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const {
    coupons,
    isLoading,
    isError,
    refetch,
    createCoupon,
    isCreatingCoupon,
    updateCoupon,
    isUpdatingCoupon,
    updateCouponStatus,
    isUpdatingCouponStatus,
  } = useAdminCoupons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateCouponRequest) => {
    if (editingCoupon) {
      await updateCoupon({ id: editingCoupon.id, data });
    } else {
      await createCoupon(data);
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-slate-800 rounded mb-4" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Coupons</h2>
        <p className="text-slate-400 text-sm mb-6">Could not retrieve coupon list from server.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm"
        >
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Tag className="w-7 h-7 text-cyan-400" /> Coupon Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create and manage promotional discount codes — {coupons.length} total
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <XCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No coupons created yet. Create your first coupon above.</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired =
                    coupon.expirationDate && new Date(coupon.expirationDate) < new Date();
                  const usageDisplay =
                    coupon.maxUsageLimit != null
                      ? `${coupon.usageCount} / ${coupon.maxUsageLimit}`
                      : `${coupon.usageCount} / ∞`;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-sm tracking-wider">
                          {coupon.code}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 text-slate-300">
                        {coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4 font-bold text-cyan-400">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : `$${Number(coupon.discountValue).toFixed(2)}`}
                      </td>

                      {/* Min Order */}
                      <td className="px-6 py-4 text-slate-300">
                        {coupon.minOrderAmount != null && coupon.minOrderAmount > 0
                          ? `$${Number(coupon.minOrderAmount).toFixed(2)}`
                          : '—'}
                      </td>

                      {/* Usage Count */}
                      <td className="px-6 py-4 text-slate-300 font-mono">{usageDisplay}</td>

                      {/* Expiry */}
                      <td className="px-6 py-4">
                        {coupon.expirationDate ? (
                          <span className={isExpired ? 'text-rose-400' : 'text-slate-300'}>
                            {new Date(coupon.expirationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-slate-500">Never</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            updateCouponStatus({ id: coupon.id, active: !coupon.isActive })
                          }
                          disabled={isUpdatingCouponStatus}
                          className="flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          title={`Click to ${coupon.isActive ? 'deactivate' : 'activate'}`}
                        >
                          {isUpdatingCouponStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          ) : coupon.isActive ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                              <span className="text-[11px] font-bold text-emerald-400">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                              <span className="text-[11px] font-bold text-slate-500">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        coupon={editingCoupon}
        isLoading={isCreatingCoupon || isUpdatingCoupon}
      />
    </div>
  );
};

export default AdminCouponsPage;
