package com.technest.backend.service;

import com.technest.backend.dto.AddToCartRequest;
import com.technest.backend.dto.CartDto;
import com.technest.backend.dto.CartItemDto;
import com.technest.backend.entity.Cart;
import com.technest.backend.entity.CartItem;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CartItemRepository;
import com.technest.backend.repository.CartRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       UserRepository userRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    private Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    public CartDto getCartForUser(String email) {
        Cart cart = getOrCreateCart(email);
        return mapToDto(cart);
    }

    public CartDto addItemToCart(String email, AddToCartRequest request) {
        if (request == null || request.getProductId() == null) {
            throw new BadRequestException("Product ID is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Cart cart = getOrCreateCart(email);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() <= 0) {
            throw new BadRequestException("Product is out of stock: " + product.getName());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int totalQuantity = item.getQuantity() + request.getQuantity();
            if (totalQuantity > product.getStock()) {
                throw new BadRequestException("Cannot add " + request.getQuantity() + " more. Only "
                        + product.getStock() + " available in stock, and " + item.getQuantity()
                        + " already in cart for product: " + product.getName());
            }
            item.setQuantity(totalQuantity);
        } else {
            if (request.getQuantity() > product.getStock()) {
                throw new BadRequestException("Requested quantity " + request.getQuantity()
                        + " exceeds available stock " + product.getStock() + " for product: " + product.getName());
            }
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.addItem(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToDto(updatedCart);
    }

    public CartDto updateCartItemQuantity(String email, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(email);

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new ForbiddenException("CartItem does not belong to user's cart");
        }

        if (quantity <= 0) {
            cart.removeItem(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            Product product = cartItem.getProduct();
            if (quantity > product.getStock()) {
                throw new BadRequestException("Requested quantity " + quantity
                        + " exceeds available stock " + product.getStock() + " for product: " + product.getName());
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        // Fetch updated cart
        return mapToDto(cartRepository.findById(cart.getId()).get());
    }

    public CartDto removeItemFromCart(String email, Long itemId) {
        Cart cart = getOrCreateCart(email);

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new ForbiddenException("CartItem does not belong to user's cart");
        }

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);

        return mapToDto(cartRepository.findById(cart.getId()).get());
    }

    private CartDto mapToDto(Cart cart) {
        List<CartItemDto> itemDtos = cart.getItems().stream()
                .map(item -> new CartItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getPrice(),
                        item.getQuantity(),
                        item.getProduct().getStock()
                ))
                .collect(Collectors.toList());

        return new CartDto(cart.getId(), cart.getUser().getId(), itemDtos);
    }
}
