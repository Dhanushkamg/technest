package com.technest.backend.service;

import com.technest.backend.dto.ReviewRequest;
import com.technest.backend.dto.ReviewResponse;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.Review;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.ReviewRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private Product testProduct;
    private Review testReview;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testProduct = new Product();
        testProduct.setId(10L);
        testProduct.setAverageRating(0.0);
        testProduct.setReviewCount(0);

        testReview = new Review();
        testReview.setId(100L);
        testReview.setUser(testUser);
        testReview.setProduct(testProduct);
        testReview.setRating(5);
        testReview.setComment("Great!");
    }

    @Test
    void createReview_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);
        request.setComment("Good");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(true);
        when(reviewRepository.existsByUserAndProduct(testUser, testProduct)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(101L);
            return r;
        });
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of(testReview)); // Mock for recalculate

        ReviewResponse response = reviewService.createReview(testUser.getEmail(), testProduct.getId(), request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        verify(productRepository, times(1)).save(testProduct);
        assertEquals(5.0, testProduct.getAverageRating());
        assertEquals(1, testProduct.getReviewCount());
    }

    @Test
    void createReview_NotPurchased_ThrowsForbidden() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> reviewService.createReview(testUser.getEmail(), testProduct.getId(), request));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_Duplicate_ThrowsBadRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(true);
        when(reviewRepository.existsByUserAndProduct(testUser, testProduct)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(testUser.getEmail(), testProduct.getId(), request));
    }

    @Test
    void updateReview_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(3);
        request.setComment("Updated");

        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of(testReview));

        ReviewResponse response = reviewService.updateReview(testUser.getEmail(), testProduct.getId(), testReview.getId(), request);

        assertNotNull(response);
        assertEquals(3, response.getRating());
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void deleteReview_Success() {
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of()); // Mock for recalculate after deletion

        reviewService.deleteReview(testUser.getEmail(), testProduct.getId(), testReview.getId());

        verify(reviewRepository, times(1)).delete(testReview);
        verify(reviewRepository, times(1)).flush();
        verify(productRepository, times(1)).save(testProduct);
        assertEquals(0.0, testProduct.getAverageRating());
        assertEquals(0, testProduct.getReviewCount());
    }
}
