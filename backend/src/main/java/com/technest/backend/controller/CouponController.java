package com.technest.backend.controller;

import com.technest.backend.dto.CouponValidateRequest;
import com.technest.backend.dto.CouponValidateResponse;
import com.technest.backend.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponValidateResponse> validateCoupon(@Valid @RequestBody CouponValidateRequest request) {
        CouponValidateResponse response = couponService.validateCoupon(request.getCouponCode(), request.getOrderAmount());
        return ResponseEntity.ok(response);
    }
}
