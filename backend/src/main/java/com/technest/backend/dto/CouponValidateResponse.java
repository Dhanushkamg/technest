package com.technest.backend.dto;

import com.technest.backend.entity.DiscountType;

import java.math.BigDecimal;

public class CouponValidateResponse {

    private boolean valid;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;

    public CouponValidateResponse() {
    }

    public static CouponValidateResponse invalid(String message) {
        CouponValidateResponse response = new CouponValidateResponse();
        response.setValid(false);
        response.setMessage(message);
        response.setDiscountAmount(BigDecimal.ZERO);
        return response;
    }

    public static CouponValidateResponse valid(String code, DiscountType discountType, BigDecimal discountValue, BigDecimal discountAmount, BigDecimal finalAmount, String message) {
        CouponValidateResponse response = new CouponValidateResponse();
        response.setValid(true);
        response.setCode(code);
        response.setDiscountType(discountType);
        response.setDiscountValue(discountValue);
        response.setDiscountAmount(discountAmount);
        response.setFinalAmount(finalAmount);
        response.setMessage(message);
        return response;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
