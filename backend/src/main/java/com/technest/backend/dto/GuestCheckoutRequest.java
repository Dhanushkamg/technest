package com.technest.backend.dto;

import com.technest.backend.entity.DeliveryAddressSnapshot;

import java.util.List;

public class GuestCheckoutRequest {

    private String guestEmail;
    private DeliveryAddressSnapshot deliveryAddress;
    private String couponCode;
    private List<GuestCartItemDto> items;

    public GuestCheckoutRequest() {
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public DeliveryAddressSnapshot getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(DeliveryAddressSnapshot deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public List<GuestCartItemDto> getItems() {
        return items;
    }

    public void setItems(List<GuestCartItemDto> items) {
        this.items = items;
    }
}
