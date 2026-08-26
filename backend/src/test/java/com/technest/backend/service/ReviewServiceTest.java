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

    @Mock private ReviewRepository reviewRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private User otherUser;
    private User adminUser;
    private Product testProduct;
    private Review testReview;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("John Doe");
        testUser.setRole("USER");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");
        otherUser.setName("Jane Smith");
        otherUser.setRole("USER");

        adminUser = new User();
        adminUser.setId(3L);
        adminUser.setEmail("admin@example.com");
        adminUser.setName("Admin User");
        adminUser.setRole("ADMIN");

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

    // 1. createReview_Success
    @Test
    void createReview_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);
        request.setComment("Good");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(true);
        when(reviewRepository.existsByUserAndProduct(testUser, testProduct)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(101L);
            return r;
        });
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of(testReview));

        ReviewResponse response = reviewService.createReview(testUser.getEmail(), testProduct.getId(), request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        verify(productRepository, times(1)).save(testProduct);
        assertEquals(5.0, testProduct.getAverageRating());
        assertEquals(1, testProduct.getReviewCount());
    }

    // 2. createReview_ProductNotFound_ThrowsException
    @Test
    void createReview_ProductNotFound_ThrowsException() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.createReview(testUser.getEmail(), 999L, request));
        verify(reviewRepository, never()).save(any());
    }

    // 3. createReview_RatingBelowOne_ThrowsBadRequest
    @Test
    void createReview_RatingBelowOne_ThrowsBadRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(0);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(testUser.getEmail(), testProduct.getId(), request));
        verify(reviewRepository, never()).save(any());
    }

    // 4. createReview_RatingAboveFive_ThrowsBadRequest
    @Test
    void createReview_RatingAboveFive_ThrowsBadRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(6);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(testUser.getEmail(), testProduct.getId(), request));
        verify(reviewRepository, never()).save(any());
    }

    // 5. createReview_DuplicateReview_ThrowsBadRequest
    @Test
    void createReview_DuplicateReview_ThrowsBadRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(true);
        when(reviewRepository.existsByUserAndProduct(testUser, testProduct)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(testUser.getEmail(), testProduct.getId(), request));
        verify(reviewRepository, never()).save(any());
    }

    // Verified purchase rejection test
    @Test
    void createReview_NotPurchased_ThrowsForbidden() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> reviewService.createReview(testUser.getEmail(), testProduct.getId(), request));
        verify(reviewRepository, never()).save(any());
    }

    // 6. getProductReviews_Success
    @Test
    void getProductReviews_Success() {
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findByProductOrderByCreatedAtDesc(testProduct)).thenReturn(List.of(testReview));

        List<ReviewResponse> reviews = reviewService.getProductReviews(testProduct.getId());

        assertNotNull(reviews);
        assertEquals(1, reviews.size());
        assertEquals("John Doe", reviews.get(0).getUserName());
    }

    // 7. updateReview_Success
    @Test
    void updateReview_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(3);
        request.setComment("Updated comment");

        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArgument(0));
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of(testReview));

        ReviewResponse response = reviewService.updateReview(testUser.getEmail(), testProduct.getId(), testReview.getId(), request);

        assertNotNull(response);
        assertEquals(3, response.getRating());
        assertEquals("Updated comment", response.getComment());
        assertNotNull(response.getUpdatedAt());
        verify(productRepository, times(1)).save(testProduct);
    }

    // 8. updateReview_OtherUser_ThrowsForbidden
    @Test
    void updateReview_OtherUser_ThrowsForbidden() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(3);

        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));

        assertThrows(ForbiddenException.class, () -> reviewService.updateReview(otherUser.getEmail(), testProduct.getId(), testReview.getId(), request));
        verify(reviewRepository, never()).save(any());
    }

    // Review mismatch validation
    @Test
    void updateReview_ProductMismatch_ThrowsBadRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(3);

        when(productRepository.findByIdWithLock(99L)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));

        assertThrows(BadRequestException.class, () -> reviewService.updateReview(testUser.getEmail(), 99L, testReview.getId(), request));
    }

    // 9. deleteReview_OwnReview_Success
    @Test
    void deleteReview_OwnReview_Success() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of());

        reviewService.deleteReview(testUser.getEmail(), testProduct.getId(), testReview.getId());

        verify(reviewRepository, times(1)).delete(testReview);
        verify(reviewRepository, times(1)).flush();
        verify(productRepository, times(1)).save(testProduct);
        assertEquals(0.0, testProduct.getAverageRating());
        assertEquals(0, testProduct.getReviewCount());
    }

    // 10. deleteReview_OtherUser_ThrowsForbidden
    @Test
    void deleteReview_OtherUser_ThrowsForbidden() {
        when(userRepository.findByEmail(otherUser.getEmail())).thenReturn(Optional.of(otherUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));

        assertThrows(ForbiddenException.class, () -> reviewService.deleteReview(otherUser.getEmail(), testProduct.getId(), testReview.getId()));
        verify(reviewRepository, never()).delete(any());
    }

    // Admin deletion test
    @Test
    void deleteReview_Admin_Success() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of());

        reviewService.deleteReview(adminUser.getEmail(), testProduct.getId(), testReview.getId());

        verify(reviewRepository, times(1)).delete(testReview);
        verify(productRepository, times(1)).save(testProduct);
    }

    // 11. recalculateRating_AfterCreate_Success
    @Test
    void recalculateRating_AfterCreate_Success() {
        Review review2 = new Review();
        review2.setId(102L);
        review2.setUser(testUser);
        review2.setProduct(testProduct);
        review2.setRating(3);

        ReviewRequest request = new ReviewRequest();
        request.setRating(3);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(orderRepository.existsByUserAndStatusAndItems_Product(testUser, OrderStatus.DELIVERED, testProduct)).thenReturn(true);
        when(reviewRepository.existsByUserAndProduct(testUser, testProduct)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(review2);
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of(testReview, review2)); // 5 and 3 => avg 4.0

        reviewService.createReview(testUser.getEmail(), testProduct.getId(), request);

        assertEquals(4.0, testProduct.getAverageRating());
        assertEquals(2, testProduct.getReviewCount());
    }

    // 12. recalculateRating_AfterUpdate_Success
    @Test
    void recalculateRating_AfterUpdate_Success() {
        testReview.setRating(2); // Updated rating
        ReviewRequest request = new ReviewRequest();
        request.setRating(2);

        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of(testReview));

        reviewService.updateReview(testUser.getEmail(), testProduct.getId(), testReview.getId(), request);

        assertEquals(2.0, testProduct.getAverageRating());
        assertEquals(1, testProduct.getReviewCount());
    }

    // 13. recalculateRating_AfterDelete_Success
    @Test
    void recalculateRating_AfterDelete_Success() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(productRepository.findByIdWithLock(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findById(testReview.getId())).thenReturn(Optional.of(testReview));
        when(reviewRepository.findByProduct(testProduct)).thenReturn(List.of());

        reviewService.deleteReview(testUser.getEmail(), testProduct.getId(), testReview.getId());

        assertEquals(0.0, testProduct.getAverageRating());
        assertEquals(0, testProduct.getReviewCount());
    }
}
