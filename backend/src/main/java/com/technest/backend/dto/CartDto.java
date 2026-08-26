package com.technest.backend.dto;

import java.util.List;

public class CartDto {
    private Long id;
    private Long userId;
    private List<CartItemDto> items;

    public CartDto() {
    }

    public CartDto(Long id, Long userId, List<CartItemDto> items) {
        this.id = id;
        this.userId = userId;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }
}
