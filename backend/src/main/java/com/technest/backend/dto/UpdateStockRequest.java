package com.technest.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateStockRequest {

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must not be negative")
    private Integer stock;

    public UpdateStockRequest() {
    }

    public UpdateStockRequest(Integer stock) {
        this.stock = stock;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}
