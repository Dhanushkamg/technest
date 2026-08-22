package com.technest.backend.dto;

import com.technest.backend.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public class PaymentConfirmRequest {

    @NotNull(message = "Status is required")
    private PaymentStatus status;

    public PaymentConfirmRequest() {
    }

    public PaymentConfirmRequest(PaymentStatus status) {
        this.status = status;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
}
