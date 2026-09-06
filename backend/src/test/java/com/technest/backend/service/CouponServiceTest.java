package com.technest.backend.service;

import com.technest.backend.dto.CouponValidateResponse;
import com.technest.backend.entity.Coupon;
import com.technest.backend.entity.DiscountType;
import com.technest.backend.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon fixedCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = new Coupon();
        percentageCoupon.setId(1L);
        percentageCoupon.setCode("PERCENT20");
        percentageCoupon.setDiscountType(DiscountType.PERCENTAGE);
        percentageCoupon.setDiscountValue(new BigDecimal("20.00"));
        percentageCoupon.setActive(true);
        percentageCoupon.setExpirationDate(LocalDateTime.now().plusDays(10));
        percentageCoupon.setMaxUsageLimit(100);
        percentageCoupon.setUsageCount(10);
        percentageCoupon.setMinOrderAmount(new BigDecimal("50.00"));

        fixedCoupon = new Coupon();
        fixedCoupon.setId(2L);
        fixedCoupon.setCode("FLAT15");
        fixedCoupon.setDiscountType(DiscountType.FIXED_AMOUNT);
        fixedCoupon.setDiscountValue(new BigDecimal("15.00"));
        fixedCoupon.setActive(true);
        fixedCoupon.setExpirationDate(LocalDateTime.now().plusDays(5));
        fixedCoupon.setMaxUsageLimit(50);
        fixedCoupon.setUsageCount(5);
        fixedCoupon.setMinOrderAmount(new BigDecimal("30.00"));
    }

    @Test
    void validateCoupon_percentage_success() {
        when(couponRepository.findByCode("PERCENT20")).thenReturn(Optional.of(percentageCoupon));

        CouponValidateResponse response = couponService.validateCoupon("PERCENT20", new BigDecimal("100.00"));

        assertThat(response.isValid()).isTrue();
        assertThat(response.getCode()).isEqualTo("PERCENT20");
        assertThat(response.getDiscountType()).isEqualTo(DiscountType.PERCENTAGE);
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(response.getFinalAmount()).isEqualByComparingTo(new BigDecimal("80.00"));
        assertThat(response.getMessage()).isEqualTo("Coupon applied successfully");

        verify(couponRepository, never()).save(any());
        assertThat(percentageCoupon.getUsageCount()).isEqualTo(10);
    }

    @Test
    void validateCoupon_fixedAmount_success() {
        when(couponRepository.findByCode("FLAT15")).thenReturn(Optional.of(fixedCoupon));

        CouponValidateResponse response = couponService.validateCoupon("flat15", new BigDecimal("100.00"));

        assertThat(response.isValid()).isTrue();
        assertThat(response.getCode()).isEqualTo("FLAT15");
        assertThat(response.getDiscountType()).isEqualTo(DiscountType.FIXED_AMOUNT);
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("15.00"));
        assertThat(response.getFinalAmount()).isEqualByComparingTo(new BigDecimal("85.00"));

        verify(couponRepository, never()).save(any());
    }

    @Test
    void validateCoupon_discountCappedAtOrderAmount() {
        fixedCoupon.setDiscountValue(new BigDecimal("150.00"));
        fixedCoupon.setMinOrderAmount(BigDecimal.ZERO);
        when(couponRepository.findByCode("FLAT15")).thenReturn(Optional.of(fixedCoupon));

        CouponValidateResponse response = couponService.validateCoupon("FLAT15", new BigDecimal("100.00"));

        assertThat(response.isValid()).isTrue();
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(response.getFinalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void validateCoupon_notFound_returnsInvalid() {
        when(couponRepository.findByCode("UNKNOWN")).thenReturn(Optional.empty());

        CouponValidateResponse response = couponService.validateCoupon("UNKNOWN", new BigDecimal("100.00"));

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Invalid coupon code");
    }

    @Test
    void validateCoupon_inactive_returnsInvalid() {
        percentageCoupon.setActive(false);
        when(couponRepository.findByCode("PERCENT20")).thenReturn(Optional.of(percentageCoupon));

        CouponValidateResponse response = couponService.validateCoupon("PERCENT20", new BigDecimal("100.00"));

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Coupon is not active");
    }

    @Test
    void validateCoupon_expired_returnsInvalid() {
        percentageCoupon.setExpirationDate(LocalDateTime.now().minusDays(1));
        when(couponRepository.findByCode("PERCENT20")).thenReturn(Optional.of(percentageCoupon));

        CouponValidateResponse response = couponService.validateCoupon("PERCENT20", new BigDecimal("100.00"));

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Coupon is expired");
    }

    @Test
    void validateCoupon_maxUsageLimitReached_returnsInvalid() {
        percentageCoupon.setUsageCount(100);
        percentageCoupon.setMaxUsageLimit(100);
        when(couponRepository.findByCode("PERCENT20")).thenReturn(Optional.of(percentageCoupon));

        CouponValidateResponse response = couponService.validateCoupon("PERCENT20", new BigDecimal("100.00"));

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Coupon usage limit reached");
    }

    @Test
    void validateCoupon_belowMinOrderAmount_returnsInvalid() {
        when(couponRepository.findByCode("PERCENT20")).thenReturn(Optional.of(percentageCoupon));

        CouponValidateResponse response = couponService.validateCoupon("PERCENT20", new BigDecimal("40.00"));

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Minimum order amount for this coupon not met");
    }

    @Test
    void validateCoupon_nullOrEmptyCode_returnsInvalid() {
        CouponValidateResponse responseNull = couponService.validateCoupon(null, new BigDecimal("100.00"));
        assertThat(responseNull.isValid()).isFalse();
        assertThat(responseNull.getMessage()).isEqualTo("Coupon code is required");

        CouponValidateResponse responseBlank = couponService.validateCoupon("   ", new BigDecimal("100.00"));
        assertThat(responseBlank.isValid()).isFalse();
        assertThat(responseBlank.getMessage()).isEqualTo("Coupon code is required");
    }

    @Test
    void validateCoupon_negativeOrNullAmount_returnsInvalid() {
        CouponValidateResponse responseNull = couponService.validateCoupon("CODE", null);
        assertThat(responseNull.isValid()).isFalse();
        assertThat(responseNull.getMessage()).isEqualTo("Invalid order amount");

        CouponValidateResponse responseNegative = couponService.validateCoupon("CODE", new BigDecimal("-10.00"));
        assertThat(responseNegative.isValid()).isFalse();
        assertThat(responseNegative.getMessage()).isEqualTo("Invalid order amount");
    }
}
