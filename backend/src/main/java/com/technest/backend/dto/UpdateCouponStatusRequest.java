package com.technest.backend.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateCouponStatusRequest {

    @NotNull(message = "Status is required")
    private Boolean active;

    public UpdateCouponStatusRequest() {
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
