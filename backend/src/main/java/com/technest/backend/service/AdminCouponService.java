package com.technest.backend.service;

import com.technest.backend.dto.CouponResponse;
import com.technest.backend.dto.CreateCouponRequest;
import com.technest.backend.dto.UpdateCouponRequest;
import com.technest.backend.entity.Coupon;
import com.technest.backend.entity.DiscountType;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CouponRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminCouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    public AdminCouponService(CouponRepository couponRepository, UserRepository userRepository) {
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
    }

    private void verifyAdminRole(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied");
        }
    }

    public CouponResponse createCoupon(String email, CreateCouponRequest request) {
        verifyAdminRole(email);

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCode(normalizedCode)) {
            throw new BadRequestException("Coupon code already exists");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
                throw new BadRequestException("Percentage discount cannot exceed 100%");
            }
        }

        Coupon coupon = new Coupon();
        coupon.setCode(normalizedCode);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setActive(true);
        coupon.setExpirationDate(request.getExpirationDate());
        coupon.setMaxUsageLimit(request.getMaxUsageLimit());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setPerUserLimit(request.getPerUserLimit());
        coupon.setFirstOrderOnly(request.getFirstOrderOnly() != null ? request.getFirstOrderOnly() : false);

        Coupon savedCoupon = couponRepository.save(coupon);
        return mapToDto(savedCoupon);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons(String email) {
        verifyAdminRole(email);
        return couponRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(String email, Long id) {
        verifyAdminRole(email);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        return mapToDto(coupon);
    }

    public CouponResponse updateCoupon(String email, Long id, UpdateCouponRequest request) {
        verifyAdminRole(email);

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (!coupon.getCode().equals(normalizedCode) && couponRepository.existsByCode(normalizedCode)) {
            throw new BadRequestException("Coupon code already exists");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
                throw new BadRequestException("Percentage discount cannot exceed 100%");
            }
        }

        coupon.setCode(normalizedCode);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setExpirationDate(request.getExpirationDate());
        coupon.setMaxUsageLimit(request.getMaxUsageLimit());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setPerUserLimit(request.getPerUserLimit());
        if (request.getFirstOrderOnly() != null) {
            coupon.setFirstOrderOnly(request.getFirstOrderOnly());
        }

        Coupon savedCoupon = couponRepository.save(coupon);
        return mapToDto(savedCoupon);
    }

    public CouponResponse updateCouponStatus(String email, Long id, boolean isActive) {
        verifyAdminRole(email);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        coupon.setActive(isActive);
        Coupon savedCoupon = couponRepository.save(coupon);
        return mapToDto(savedCoupon);
    }

    private CouponResponse mapToDto(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.isActive(),
                coupon.getExpirationDate(),
                coupon.getMaxUsageLimit(),
                coupon.getUsageCount(),
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                coupon.getPerUserLimit(),
                coupon.isFirstOrderOnly()
        );
    }
}
