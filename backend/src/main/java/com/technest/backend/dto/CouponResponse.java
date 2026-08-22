package com.technest.backend.dto;

import com.technest.backend.entity.DiscountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponResponse {

    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private boolean isActive;
    private LocalDateTime expirationDate;
    private Integer maxUsageLimit;
    private Integer usageCount;
    private BigDecimal minOrderAmount;

    public CouponResponse() {
    }

    public CouponResponse(Long id, String code, DiscountType discountType, BigDecimal discountValue,
                          boolean isActive, LocalDateTime expirationDate, Integer maxUsageLimit,
                          Integer usageCount, BigDecimal minOrderAmount) {
        this.id = id;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.isActive = isActive;
        this.expirationDate = expirationDate;
        this.maxUsageLimit = maxUsageLimit;
        this.usageCount = usageCount;
        this.minOrderAmount = minOrderAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public Integer getMaxUsageLimit() {
        return maxUsageLimit;
    }

    public void setMaxUsageLimit(Integer maxUsageLimit) {
        this.maxUsageLimit = maxUsageLimit;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }
}
