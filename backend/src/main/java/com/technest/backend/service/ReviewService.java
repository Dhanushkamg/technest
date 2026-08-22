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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Review> reviews = reviewRepository.findByProductOrderByCreatedAtDesc(product);
        return reviews.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse createReview(String email, Long productId, ReviewRequest request) {
        validateRating(request.getRating());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!orderRepository.existsByUserAndStatusAndItems_Product(user, OrderStatus.DELIVERED, product)) {
            throw new ForbiddenException("You can only review products you have purchased and received.");
        }

        if (reviewRepository.existsByUserAndProduct(user, product)) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = reviewRepository.save(review);
        updateProductRating(product);

        return toResponse(review);
    }

    @Transactional
    public ReviewResponse updateReview(String email, Long productId, Long reviewId, ReviewRequest request) {
        validateRating(request.getRating());

        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = getReviewAndVerifyOwnership(email, productId, reviewId);

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUpdatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);
        updateProductRating(product);

        return toResponse(review);
    }

    @Transactional
    public void deleteReview(String email, Long productId, Long reviewId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getProduct().getId().equals(productId)) {
            throw new BadRequestException("Review does not belong to the specified product.");
        }

        boolean isOwner = review.getUser().getEmail().equals(email);
        boolean isAdmin = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You can only modify your own reviews.");
        }

        reviewRepository.delete(review);
        reviewRepository.flush(); // ensure deletion before recalculating
        updateProductRating(product);
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }
    }

    private Review getReviewAndVerifyOwnership(String email, Long productId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getProduct().getId().equals(productId)) {
            throw new BadRequestException("Review does not belong to the specified product.");
        }

        if (!review.getUser().getEmail().equals(email)) {
            throw new ForbiddenException("You can only modify your own reviews.");
        }

        return review;
    }

    private void updateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProduct(product);
        int count = reviews.size();
        if (count == 0) {
            product.setAverageRating(0.0);
            product.setReviewCount(0);
        } else {
            double sum = reviews.stream().mapToDouble(Review::getRating).sum();
            // Round to 1 decimal place
            double avg = Math.round((sum / count) * 10.0) / 10.0;
            product.setAverageRating(avg);
            product.setReviewCount(count);
        }
        productRepository.save(product);
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProduct().getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}
