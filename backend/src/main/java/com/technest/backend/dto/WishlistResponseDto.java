package com.technest.backend.dto;

import java.util.List;

public class WishlistResponseDto {
    private List<WishlistItemDto> items;

    public WishlistResponseDto() {
    }

    public WishlistResponseDto(List<WishlistItemDto> items) {
        this.items = items;
    }

    public List<WishlistItemDto> getItems() {
        return items;
    }

    public void setItems(List<WishlistItemDto> items) {
        this.items = items;
    }
}
