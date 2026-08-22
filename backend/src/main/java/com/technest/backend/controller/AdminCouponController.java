package com.technest.backend.controller;

import com.technest.backend.dto.CouponResponse;
import com.technest.backend.dto.CreateCouponRequest;
import com.technest.backend.dto.UpdateCouponRequest;
import com.technest.backend.dto.UpdateCouponStatusRequest;
import com.technest.backend.service.AdminCouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    public AdminCouponController(AdminCouponService adminCouponService) {
        this.adminCouponService = adminCouponService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        String email = getAuthenticatedUserEmail();
        CouponResponse response = adminCouponService.createCoupon(email, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        String email = getAuthenticatedUserEmail();
        List<CouponResponse> responses = adminCouponService.getAllCoupons(email);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        CouponResponse response = adminCouponService.getCouponById(email, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCouponRequest request) {
        String email = getAuthenticatedUserEmail();
        CouponResponse response = adminCouponService.updateCoupon(email, id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CouponResponse> updateCouponStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCouponStatusRequest request) {
        String email = getAuthenticatedUserEmail();
        CouponResponse response = adminCouponService.updateCouponStatus(email, id, request.getActive());
        return ResponseEntity.ok(response);
    }
}
