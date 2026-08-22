package com.technest.backend.service;

import com.technest.backend.dto.CouponResponse;
import com.technest.backend.dto.CreateCouponRequest;
import com.technest.backend.dto.UpdateCouponRequest;
import com.technest.backend.entity.Coupon;
import com.technest.backend.entity.DiscountType;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.repository.CouponRepository;
import com.technest.backend.repository.UserRepository;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminCouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminCouponService adminCouponService;

    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setEmail("admin@example.com");
        adminUser.setRole("ADMIN");

        normalUser = new User();
        normalUser.setEmail("user@example.com");
        normalUser.setRole("USER");
    }

    @Test
    void createCoupon_success() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(couponRepository.existsByCode("SAVE10")).thenReturn(false);

        Coupon savedCoupon = new Coupon();
        savedCoupon.setId(1L);
        savedCoupon.setCode("SAVE10");
        savedCoupon.setDiscountType(DiscountType.PERCENTAGE);
        savedCoupon.setDiscountValue(BigDecimal.valueOf(10));
        savedCoupon.setActive(true);
        savedCoupon.setUsageCount(0);

        when(couponRepository.save(any(Coupon.class))).thenReturn(savedCoupon);

        CreateCouponRequest request = new CreateCouponRequest();
        request.setCode("SAVE10");
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(BigDecimal.valueOf(10));

        CouponResponse response = adminCouponService.createCoupon("admin@example.com", request);

        assertThat(response.getCode()).isEqualTo("SAVE10");
        assertThat(response.isActive()).isTrue();
    }

    @Test
    void createCoupon_nonAdmin_throwsForbidden() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(normalUser));

        CreateCouponRequest request = new CreateCouponRequest();
        request.setCode("SAVE10");

        assertThatThrownBy(() -> adminCouponService.createCoupon("user@example.com", request))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void createCoupon_duplicateCode_throwsBadRequest() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(couponRepository.existsByCode("SAVE10")).thenReturn(true);

        CreateCouponRequest request = new CreateCouponRequest();
        request.setCode("SAVE10");

        assertThatThrownBy(() -> adminCouponService.createCoupon("admin@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void createCoupon_caseInsensitiveDuplicate_throwsBadRequest() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(couponRepository.existsByCode("SAVE10")).thenReturn(true);

        CreateCouponRequest request = new CreateCouponRequest();
        request.setCode("save10");

        assertThatThrownBy(() -> adminCouponService.createCoupon("admin@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void createCoupon_percentageAbove100_throwsBadRequest() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(couponRepository.existsByCode("SAVE110")).thenReturn(false);

        CreateCouponRequest request = new CreateCouponRequest();
        request.setCode("SAVE110");
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(BigDecimal.valueOf(110));

        assertThatThrownBy(() -> adminCouponService.createCoupon("admin@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot exceed 100%");
    }

    @Test
    void updateCouponStatus_success() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        Coupon coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("SAVE10");
        coupon.setActive(true);

        when(couponRepository.findById(1L)).thenReturn(Optional.of(coupon));
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

        CouponResponse response = adminCouponService.updateCouponStatus("admin@example.com", 1L, false);

        assertThat(response.isActive()).isFalse();
    }
}
