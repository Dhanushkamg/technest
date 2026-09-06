package com.technest.backend.dto;

import java.math.BigDecimal;

public class RevenueTimelinePointDto {

    private String date;
    private BigDecimal revenue;
    private long orderCount;

    public RevenueTimelinePointDto() {
    }

    public RevenueTimelinePointDto(String date, BigDecimal revenue, long orderCount) {
        this.date = date;
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        this.orderCount = orderCount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(long orderCount) {
        this.orderCount = orderCount;
    }
}
