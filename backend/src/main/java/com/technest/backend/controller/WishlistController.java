package com.technest.backend.controller;

import com.technest.backend.dto.WishlistResponseDto;
import com.technest.backend.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<WishlistResponseDto> getWishlist() {
        String email = getAuthenticatedUserEmail();
        WishlistResponseDto response = wishlistService.getWishlist(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistResponseDto> addProductToWishlist(@PathVariable Long productId) {
        String email = getAuthenticatedUserEmail();
        WishlistResponseDto response = wishlistService.addProductToWishlist(email, productId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<WishlistResponseDto> removeProductFromWishlist(@PathVariable Long productId) {
        String email = getAuthenticatedUserEmail();
        WishlistResponseDto response = wishlistService.removeProductFromWishlist(email, productId);
        return ResponseEntity.ok(response);
    }
}
