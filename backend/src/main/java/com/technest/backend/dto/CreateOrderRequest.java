package com.technest.backend.dto;

public class CreateOrderRequest {

    private Long addressId;

    public CreateOrderRequest() {
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }
}
