package com.technest.backend.controller;

import com.technest.backend.dto.AddToCartRequest;
import com.technest.backend.dto.CartDto;
import com.technest.backend.dto.UpdateCartItemRequest;
import com.technest.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart() {
        String email = getAuthenticatedUserEmail();
        CartDto cartDto = cartService.getCartForUser(email);
        return ResponseEntity.ok(cartDto);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItemToCart(@RequestBody AddToCartRequest request) {
        String email = getAuthenticatedUserEmail();
        CartDto cartDto = cartService.addItemToCart(email, request);
        return ResponseEntity.ok(cartDto);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateCartItemQuantity(
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemRequest request) {
        String email = getAuthenticatedUserEmail();
        CartDto cartDto = cartService.updateCartItemQuantity(email, itemId, request.getQuantity());
        return ResponseEntity.ok(cartDto);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItemFromCart(@PathVariable Long itemId) {
        String email = getAuthenticatedUserEmail();
        CartDto cartDto = cartService.removeItemFromCart(email, itemId);
        return ResponseEntity.ok(cartDto);
    }
}
