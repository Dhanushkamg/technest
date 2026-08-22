package com.technest.backend.service;

import com.technest.backend.dto.WishlistItemDto;
import com.technest.backend.dto.WishlistResponseDto;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.entity.WishlistItem;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import com.technest.backend.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistItemRepository wishlistRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public WishlistResponseDto getWishlist(String email) {
        List<WishlistItem> items = wishlistRepository.findByUser_Email(email);
        return new WishlistResponseDto(items.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @Transactional
    public WishlistResponseDto addProductToWishlist(String email, Long productId) {
        if (wishlistRepository.existsByUser_EmailAndProduct_Id(email, productId)) {
            throw new BadRequestException("Product is already in the wishlist");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + productId));

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        wishlistRepository.save(item);

        return getWishlist(email);
    }

    @Transactional
    public WishlistResponseDto removeProductFromWishlist(String email, Long productId) {
        WishlistItem item = wishlistRepository.findByUser_EmailAndProduct_Id(email, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in wishlist"));

        wishlistRepository.delete(item);

        return getWishlist(email);
    }

    private WishlistItemDto mapToDto(WishlistItem item) {
        WishlistItemDto dto = new WishlistItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setPrice(item.getProduct().getPrice());
        return dto;
    }
}
