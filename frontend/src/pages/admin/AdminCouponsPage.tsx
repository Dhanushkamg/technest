import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAdminCoupons } from '../../hooks/admin/useAdminCoupons';
import CouponFormModal from '../../components/admin/CouponFormModal';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
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
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-20">
        <ErrorState
          title="Failed to Load Coupons"
          description="Could not retrieve coupon list from server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Tag className="w-7 h-7 text-brand-500 dark:text-brand-400" /> Coupon Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage promotional discount codes — {coupons.length} total
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          variant="primary"
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <EmptyState
                      title="No Coupons Found"
                      description="No coupons created yet. Create your first coupon above."
                    />
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
                    <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-sm tracking-wider">
                          {coupon.code}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : `$${Number(coupon.discountValue).toFixed(2)}`}
                      </td>

                      {/* Min Order Amount */}
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {coupon.minOrderAmount != null && coupon.minOrderAmount > 0
                          ? `$${Number(coupon.minOrderAmount).toFixed(2)}`
                          : '—'}
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {usageDisplay}
                      </td>

                      {/* Expiration */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {coupon.expirationDate ? (
                          <span className={isExpired ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}>
                            {new Date(coupon.expirationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          'No Expiry'
                        )}
                      </td>

                      {/* Active Toggle Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            updateCouponStatus({ id: coupon.id, active: !coupon.isActive })
                          }
                          disabled={isUpdatingCouponStatus}
                          className="flex items-center gap-1.5 focus:outline-none transition-colors"
                          title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          className="p-2 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
