package com.technest.backend.dto;

import java.math.BigDecimal;

public class ProductVariantDto {
    private Long id;
    private String color;
    private String size;
    private String sku;
    private Integer stock;
    private BigDecimal priceOverride;

    public ProductVariantDto() {
    }

    public ProductVariantDto(Long id, String color, String size, String sku, Integer stock, BigDecimal priceOverride) {
        this.id = id;
        this.color = color;
        this.size = size;
        this.sku = sku;
        this.stock = stock;
        this.priceOverride = priceOverride;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public BigDecimal getPriceOverride() {
        return priceOverride;
    }

    public void setPriceOverride(BigDecimal priceOverride) {
        this.priceOverride = priceOverride;
    }
}
