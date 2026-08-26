package com.technest.backend.dto;

import jakarta.validation.constraints.NotNull;

public class PayHereCreateRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    public PayHereCreateRequest() {
    }

    public PayHereCreateRequest(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}
