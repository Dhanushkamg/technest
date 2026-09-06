import axiosClient from './axiosClient';
import type { CouponValidateRequest, CouponValidateResponse } from '../types/couponValidation';

export const couponApi = {
  validateCoupon: async (couponCode: string, orderAmount: number): Promise<CouponValidateResponse> => {
    const request: CouponValidateRequest = { couponCode, orderAmount };
    const response = await axiosClient.post<CouponValidateResponse>('/coupons/validate', request);
    return response.data;
  },
};

export default couponApi;
