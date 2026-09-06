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
    private BigDecimal maxDiscountAmount;
    private Integer perUserLimit;
    private boolean firstOrderOnly;

    public CouponResponse() {
    }

    public CouponResponse(Long id, String code, DiscountType discountType, BigDecimal discountValue,
                          boolean isActive, LocalDateTime expirationDate, Integer maxUsageLimit,
                          Integer usageCount, BigDecimal minOrderAmount) {
        this(id, code, discountType, discountValue, isActive, expirationDate, maxUsageLimit, usageCount, minOrderAmount, null, null, false);
    }

    public CouponResponse(Long id, String code, DiscountType discountType, BigDecimal discountValue,
                          boolean isActive, LocalDateTime expirationDate, Integer maxUsageLimit,
                          Integer usageCount, BigDecimal minOrderAmount, BigDecimal maxDiscountAmount,
                          Integer perUserLimit, boolean firstOrderOnly) {
        this.id = id;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.isActive = isActive;
        this.expirationDate = expirationDate;
        this.maxUsageLimit = maxUsageLimit;
        this.usageCount = usageCount;
        this.minOrderAmount = minOrderAmount;
        this.maxDiscountAmount = maxDiscountAmount;
        this.perUserLimit = perUserLimit;
        this.firstOrderOnly = firstOrderOnly;
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

    public BigDecimal getMaxDiscountAmount() {
        return maxDiscountAmount;
    }

    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }

    public Integer getPerUserLimit() {
        return perUserLimit;
    }

    public void setPerUserLimit(Integer perUserLimit) {
        this.perUserLimit = perUserLimit;
    }

    public boolean isFirstOrderOnly() {
        return firstOrderOnly;
    }

    public void setFirstOrderOnly(boolean firstOrderOnly) {
        this.firstOrderOnly = firstOrderOnly;
    }
}
