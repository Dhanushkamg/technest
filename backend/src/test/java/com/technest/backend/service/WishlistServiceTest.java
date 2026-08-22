package com.technest.backend.service;

import com.technest.backend.dto.WishlistResponseDto;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.entity.WishlistItem;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import com.technest.backend.repository.WishlistItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WishlistServiceTest {

    @Mock
    private WishlistItemRepository wishlistRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WishlistService wishlistService;

    private User testUser;
    private Product testProduct;
    private WishlistItem testItem;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testProduct = new Product();
        testProduct.setId(10L);
        testProduct.setName("Test Product");
        testProduct.setPrice(new BigDecimal("99.99"));

        testItem = new WishlistItem();
        testItem.setId(100L);
        testItem.setUser(testUser);
        testItem.setProduct(testProduct);
    }

    @Test
    void getWishlist_ReturnsItems() {
        when(wishlistRepository.findByUser_Email(testUser.getEmail())).thenReturn(List.of(testItem));

        WishlistResponseDto response = wishlistService.getWishlist(testUser.getEmail());

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals("Test Product", response.getItems().get(0).getProductName());
        verify(wishlistRepository, times(1)).findByUser_Email(testUser.getEmail());
    }

    @Test
    void addProductToWishlist_Success() {
        when(wishlistRepository.existsByUser_EmailAndProduct_Id(testUser.getEmail(), testProduct.getId())).thenReturn(false);
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(wishlistRepository.findByUser_Email(testUser.getEmail())).thenReturn(List.of(testItem)); // Mocking the getWishlist call

        WishlistResponseDto response = wishlistService.addProductToWishlist(testUser.getEmail(), testProduct.getId());

        assertNotNull(response);
        verify(wishlistRepository, times(1)).save(any(WishlistItem.class));
    }

    @Test
    void addProductToWishlist_AlreadyExists_ThrowsException() {
        when(wishlistRepository.existsByUser_EmailAndProduct_Id(testUser.getEmail(), testProduct.getId())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> wishlistService.addProductToWishlist(testUser.getEmail(), testProduct.getId()));
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    void removeProductFromWishlist_Success() {
        when(wishlistRepository.findByUser_EmailAndProduct_Id(testUser.getEmail(), testProduct.getId())).thenReturn(Optional.of(testItem));
        when(wishlistRepository.findByUser_Email(testUser.getEmail())).thenReturn(List.of()); // Empty wishlist after removal

        WishlistResponseDto response = wishlistService.removeProductFromWishlist(testUser.getEmail(), testProduct.getId());

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        verify(wishlistRepository, times(1)).delete(testItem);
    }

    @Test
    void removeProductFromWishlist_NotFound_ThrowsException() {
        when(wishlistRepository.findByUser_EmailAndProduct_Id(testUser.getEmail(), testProduct.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> wishlistService.removeProductFromWishlist(testUser.getEmail(), testProduct.getId()));
        verify(wishlistRepository, never()).delete(any());
    }
}
