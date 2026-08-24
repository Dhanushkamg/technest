import axiosClient from '../axiosClient';
import type { Coupon, CreateCouponRequest, UpdateCouponRequest, UpdateCouponStatusRequest } from '../../types';

export const couponAdminApi = {
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await axiosClient.get<Coupon[]>('/admin/coupons');
    return response.data;
  },

  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await axiosClient.get<Coupon>(`/admin/coupons/${id}`);
    return response.data;
  },

  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await axiosClient.post<Coupon>('/admin/coupons', data);
    return response.data;
  },

  updateCoupon: async (id: number, data: UpdateCouponRequest): Promise<Coupon> => {
    const response = await axiosClient.put<Coupon>(`/admin/coupons/${id}`, data);
    return response.data;
  },

  updateCouponStatus: async (id: number, active: boolean): Promise<Coupon> => {
    const data: UpdateCouponStatusRequest = { active };
    const response = await axiosClient.patch<Coupon>(`/admin/coupons/${id}/status`, data);
    return response.data;
  },
};

export default couponAdminApi;
