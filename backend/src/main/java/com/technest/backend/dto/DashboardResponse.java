package com.technest.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private long totalUsers;
    private long totalProducts;
    private long totalCategories;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long pendingOrders;
    private long confirmedOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long lowStockProducts;
    private List<OrderDto> recentOrders;
    private List<TopSellingProductDto> topSellingProducts;

    public DashboardResponse() {
    }

    public DashboardResponse(long totalUsers, long totalProducts, long totalCategories,
                             long totalOrders, BigDecimal totalRevenue,
                             long pendingOrders, long confirmedOrders, long shippedOrders,
                             long deliveredOrders, long cancelledOrders, long lowStockProducts,
                             List<OrderDto> recentOrders, List<TopSellingProductDto> topSellingProducts) {
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.totalCategories = totalCategories;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.pendingOrders = pendingOrders;
        this.confirmedOrders = confirmedOrders;
        this.shippedOrders = shippedOrders;
        this.deliveredOrders = deliveredOrders;
        this.cancelledOrders = cancelledOrders;
        this.lowStockProducts = lowStockProducts;
        this.recentOrders = recentOrders;
        this.topSellingProducts = topSellingProducts;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getConfirmedOrders() { return confirmedOrders; }
    public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }

    public long getShippedOrders() { return shippedOrders; }
    public void setShippedOrders(long shippedOrders) { this.shippedOrders = shippedOrders; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    public List<OrderDto> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<OrderDto> recentOrders) { this.recentOrders = recentOrders; }

    public List<TopSellingProductDto> getTopSellingProducts() { return topSellingProducts; }
    public void setTopSellingProducts(List<TopSellingProductDto> topSellingProducts) { this.topSellingProducts = topSellingProducts; }
}
