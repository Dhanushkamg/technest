package com.technest.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CouponValidateRequest {

    @NotBlank(message = "Coupon code is required")
    private String couponCode;

    @NotNull(message = "Order amount is required")
    @DecimalMin(value = "0.0", message = "Order amount cannot be negative")
    private BigDecimal orderAmount;

    public CouponValidateRequest() {
    }

    public CouponValidateRequest(String couponCode, BigDecimal orderAmount) {
        this.couponCode = couponCode;
        this.orderAmount = orderAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public BigDecimal getOrderAmount() {
        return orderAmount;
    }

    public void setOrderAmount(BigDecimal orderAmount) {
        this.orderAmount = orderAmount;
    }
}
