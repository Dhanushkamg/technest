export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  expirationDate?: string | null;
  maxUsageLimit?: number | null;
  usageCount: number;
  minOrderAmount?: number | null;
}

export interface CreateCouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expirationDate?: string | null;
  maxUsageLimit?: number | null;
  minOrderAmount?: number | null;
}

export interface UpdateCouponRequest {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  expirationDate?: string | null;
  maxUsageLimit?: number | null;
  minOrderAmount?: number | null;
}

export interface UpdateCouponStatusRequest {
  active: boolean;
}
