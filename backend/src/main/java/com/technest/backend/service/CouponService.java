package com.technest.backend.service;

import com.technest.backend.dto.CouponValidateResponse;
import com.technest.backend.entity.Coupon;
import com.technest.backend.entity.DiscountType;
import com.technest.backend.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public CouponValidateResponse validateCoupon(String couponCode, BigDecimal orderAmount) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return CouponValidateResponse.invalid("Coupon code is required");
        }
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) < 0) {
            return CouponValidateResponse.invalid("Invalid order amount");
        }

        String normalizedCode = couponCode.trim().toUpperCase();
        Optional<Coupon> couponOpt = couponRepository.findByCode(normalizedCode);

        if (couponOpt.isEmpty()) {
            return CouponValidateResponse.invalid("Invalid coupon code");
        }

        Coupon coupon = couponOpt.get();

        if (!coupon.isActive()) {
            return CouponValidateResponse.invalid("Coupon is not active");
        }

        if (coupon.getExpirationDate() != null && LocalDateTime.now().isAfter(coupon.getExpirationDate())) {
            return CouponValidateResponse.invalid("Coupon is expired");
        }

        if (coupon.getMaxUsageLimit() != null && coupon.getUsageCount() >= coupon.getMaxUsageLimit()) {
            return CouponValidateResponse.invalid("Coupon usage limit reached");
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponValidateResponse.invalid("Minimum order amount for this coupon not met");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        } else if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discountAmount = coupon.getDiscountValue();
        }

        if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discountAmount = coupon.getMaxDiscountAmount();
        }

        if (discountAmount.compareTo(orderAmount) > 0) {
            discountAmount = orderAmount;
        }

        BigDecimal finalAmount = orderAmount.subtract(discountAmount);

        return CouponValidateResponse.valid(
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                discountAmount,
                finalAmount,
                "Coupon applied successfully"
        );
    }
}
