export interface CouponValidateRequest {
  couponCode: string;
  orderAmount: number;
}

export interface CouponValidateResponse {
  valid: boolean;
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}
