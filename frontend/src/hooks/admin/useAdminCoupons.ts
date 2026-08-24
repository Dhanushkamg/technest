import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { couponAdminApi } from '../../api/admin/couponAdminApi';
import type { CreateCouponRequest, UpdateCouponRequest } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const useAdminCoupons = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN';

  const couponsQuery = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: couponAdminApi.getAllCoupons,
    enabled: isAuthenticated && isAdmin,
    staleTime: 1000 * 60 * 2,
  });

  const createCouponMutation = useMutation({
    mutationFn: (data: CreateCouponRequest) => couponAdminApi.createCoupon(data),
    onSuccess: () => {
      toast.success('Coupon created successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create coupon.');
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCouponRequest }) =>
      couponAdminApi.updateCoupon(id, data),
    onSuccess: () => {
      toast.success('Coupon updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update coupon.');
    },
  });

  const updateCouponStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      couponAdminApi.updateCouponStatus(id, active),
    onSuccess: (_, variables) => {
      toast.success(`Coupon status set to ${variables.active ? 'Active' : 'Inactive'}`);
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update coupon status.');
    },
  });

  return {
    ...couponsQuery,
    coupons: couponsQuery.data || [],
    createCoupon: createCouponMutation.mutateAsync,
    isCreatingCoupon: createCouponMutation.isPending,
    updateCoupon: updateCouponMutation.mutateAsync,
    isUpdatingCoupon: updateCouponMutation.isPending,
    updateCouponStatus: updateCouponStatusMutation.mutateAsync,
    isUpdatingCouponStatus: updateCouponStatusMutation.isPending,
  };
};

export default useAdminCoupons;
