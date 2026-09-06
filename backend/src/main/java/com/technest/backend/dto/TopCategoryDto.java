package com.technest.backend.dto;

import java.math.BigDecimal;

public class TopCategoryDto {

    private Long categoryId;
    private String categoryName;
    private BigDecimal revenue;
    private long itemCount;

    public TopCategoryDto() {
    }

    public TopCategoryDto(Long categoryId, String categoryName, BigDecimal revenue, long itemCount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        this.itemCount = itemCount;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public long getItemCount() {
        return itemCount;
    }

    public void setItemCount(long itemCount) {
        this.itemCount = itemCount;
    }
}
