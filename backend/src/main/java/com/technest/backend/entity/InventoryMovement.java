package com.technest.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "inventory_movements",
    indexes = {
        @Index(name = "idx_inv_mov_product", columnList = "product_id"),
        @Index(name = "idx_inv_mov_created_at", columnList = "created_at")
    }
)
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer oldStock;

    @Column(nullable = false)
    private Integer quantityChange;

    @Column(nullable = false)
    private Integer newStock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;

    @Column
    private String reason;

    @Column(nullable = false)
    private String responsibleUser;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public InventoryMovement() {
    }

    public InventoryMovement(Product product, Integer oldStock, Integer quantityChange,
                             Integer newStock, MovementType movementType, String reason,
                             String responsibleUser) {
        this.product = product;
        this.oldStock = oldStock;
        this.quantityChange = quantityChange;
        this.newStock = newStock;
        this.movementType = movementType;
        this.reason = reason;
        this.responsibleUser = responsibleUser;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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
