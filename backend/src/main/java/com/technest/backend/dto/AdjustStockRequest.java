package com.technest.backend.dto;

import jakarta.validation.constraints.NotNull;

public class AdjustStockRequest {

    @NotNull(message = "Quantity adjustment is required")
    private Integer quantity;

    public AdjustStockRequest() {
    }

    public AdjustStockRequest(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
