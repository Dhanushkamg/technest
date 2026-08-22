package com.technest.backend.service;

import com.technest.backend.dto.AddToCartRequest;
import com.technest.backend.dto.CartDto;
import com.technest.backend.entity.Cart;
import com.technest.backend.entity.CartItem;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CartItemRepository;
import com.technest.backend.repository.CartRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private User user;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Electronics");

        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        product = new Product();
        product.setId(10L);
        product.setName("Test Product");
        product.setPrice(BigDecimal.valueOf(100));
        product.setStock(5);
        product.setCategory(category);

        cart = new Cart();
        cart.setId(1L);
        cart.setUser(user);
    }

    private AddToCartRequest request(Long productId, int qty) {
        AddToCartRequest r = new AddToCartRequest();
        r.setProductId(productId);
        r.setQuantity(qty);
        return r;
    }

    // =========================================================
    // addItemToCart — add new item within stock
    // =========================================================

    @Test
    void addItemToCart_newItem_withinStock_succeeds() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartDto result = cartService.addItemToCart("user@example.com", request(10L, 3));

        assertThat(result).isNotNull();
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addItemToCart_newItem_exceedsStock_throwsBadRequest() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        // Stock is 5, requesting 6
        assertThatThrownBy(() -> cartService.addItemToCart("user@example.com", request(10L, 6)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("exceeds available stock");

        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void addItemToCart_outOfStock_product_throwsBadRequest() {
        product.setStock(0);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> cartService.addItemToCart("user@example.com", request(10L, 1)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("out of stock");
    }

    @Test
    void addItemToCart_existingItem_combinedWithinStock_succeeds() {
        // Cart already has 3 items
        CartItem existing = new CartItem();
        existing.setId(1L);
        existing.setCart(cart);
        existing.setProduct(product);
        existing.setQuantity(3);
        cart.addItem(existing);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        // Adding 2 more: 3 + 2 = 5 <= stock 5
        cartService.addItemToCart("user@example.com", request(10L, 2));

        assertThat(existing.getQuantity()).isEqualTo(5);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addItemToCart_existingItem_combinedExceedsStock_throwsBadRequest() {
        // Cart already has 3 items
        CartItem existing = new CartItem();
        existing.setId(1L);
        existing.setCart(cart);
        existing.setProduct(product);
        existing.setQuantity(3);
        cart.addItem(existing);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        // Adding 3 more: 3 + 3 = 6 > stock 5
        assertThatThrownBy(() -> cartService.addItemToCart("user@example.com", request(10L, 3)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already in cart");

        verify(cartRepository, never()).save(any(Cart.class));
    }

    // =========================================================
    // updateCartItemQuantity
    // =========================================================

    @Test
    void updateCartItemQuantity_withinStock_succeeds() {
        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(3);
        cart.addItem(cartItem);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(cartItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(cartItem);
        when(cartRepository.findById(1L)).thenReturn(Optional.of(cart));

        cartService.updateCartItemQuantity("user@example.com", 1L, 5);

        assertThat(cartItem.getQuantity()).isEqualTo(5);
    }

    @Test
    void updateCartItemQuantity_exceedsStock_throwsBadRequest() {
        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        cart.addItem(cartItem);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(cartItem));

        // Stock is 5, requesting 6
        assertThatThrownBy(() -> cartService.updateCartItemQuantity("user@example.com", 1L, 6))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("exceeds available stock");
    }

    @Test
    void updateCartItemQuantity_zeroQuantity_removesItem() {
        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(3);
        cart.addItem(cartItem);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(cartItem));
        when(cartRepository.findById(1L)).thenReturn(Optional.of(cart));

        cartService.updateCartItemQuantity("user@example.com", 1L, 0);

        verify(cartItemRepository).delete(cartItem);
    }

    @Test
    void updateCartItemQuantity_wrongCart_throwsForbidden() {
        Cart anotherCart = new Cart();
        anotherCart.setId(99L);
        anotherCart.setUser(user);

        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setCart(anotherCart);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(cartItem));

        assertThatThrownBy(() -> cartService.updateCartItemQuantity("user@example.com", 1L, 1))
                .isInstanceOf(ForbiddenException.class);
    }

    // =========================================================
    // Validation — zero/null quantity
    // =========================================================

    @Test
    void addItemToCart_zeroQuantity_throwsBadRequest() {
        assertThatThrownBy(() -> cartService.addItemToCart("user@example.com", request(10L, 0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Quantity must be greater than 0");
    }

    @Test
    void addItemToCart_productNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.addItemToCart("user@example.com", request(999L, 1)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");
    }
}
