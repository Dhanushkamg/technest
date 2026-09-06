package com.technest.backend.dto;

import jakarta.validation.constraints.NotNull;

public class AdjustStockRequest {

    @NotNull(message = "Quantity adjustment is required")
    private Integer quantity;

    private com.technest.backend.entity.MovementType movementType = com.technest.backend.entity.MovementType.ADJUSTMENT;
    private String reason;

    public AdjustStockRequest() {
    }

    public AdjustStockRequest(Integer quantity) {
        this.quantity = quantity;
    }

    public AdjustStockRequest(Integer quantity, com.technest.backend.entity.MovementType movementType, String reason) {
        this.quantity = quantity;
        this.movementType = movementType != null ? movementType : com.technest.backend.entity.MovementType.ADJUSTMENT;
        this.reason = reason;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getAdjustment() {
        return quantity;
    }

    public void setAdjustment(Integer adjustment) {
        if (this.quantity == null) {
            this.quantity = adjustment;
        }
    }

    public com.technest.backend.entity.MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(com.technest.backend.entity.MovementType movementType) {
        this.movementType = movementType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
