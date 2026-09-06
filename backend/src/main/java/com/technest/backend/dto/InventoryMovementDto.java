package com.technest.backend.dto;

import com.technest.backend.entity.MovementType;

import java.time.LocalDateTime;

public class InventoryMovementDto {

    private Long id;
    private Long productId;
    private String productName;
    private Integer oldStock;
    private Integer quantityChange;
    private Integer newStock;
    private MovementType movementType;
    private String reason;
    private String responsibleUser;
    private LocalDateTime createdAt;

    public InventoryMovementDto() {
    }

    public InventoryMovementDto(Long id, Long productId, String productName, Integer oldStock,
                                Integer quantityChange, Integer newStock, MovementType movementType,
                                String reason, String responsibleUser, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.oldStock = oldStock;
        this.quantityChange = quantityChange;
        this.newStock = newStock;
        this.movementType = movementType;
        this.reason = reason;
        this.responsibleUser = responsibleUser;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getOldStock() {
        return oldStock;
    }

    public void setOldStock(Integer oldStock) {
        this.oldStock = oldStock;
    }

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public Integer getNewStock() {
        return newStock;
    }

    public void setNewStock(Integer newStock) {
        this.newStock = newStock;
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

    public String getResponsibleUser() {
        return responsibleUser;
    }

    public void setResponsibleUser(String responsibleUser) {
        this.responsibleUser = responsibleUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
