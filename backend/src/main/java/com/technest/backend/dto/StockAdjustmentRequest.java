package com.technest.backend.dto;

import com.technest.backend.entity.MovementType;
import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {

    private Long productId;

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;

    private MovementType movementType = MovementType.ADJUSTMENT;

    private String reason;

    public StockAdjustmentRequest() {
    }

    public StockAdjustmentRequest(Long productId, Integer quantityChange, MovementType movementType, String reason) {
        this.productId = productId;
        this.quantityChange = quantityChange;
        this.movementType = movementType != null ? movementType : MovementType.ADJUSTMENT;
        this.reason = reason;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(MovementType movementType) {
        this.movementType = movementType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
