package com.technest.backend.repository;

import com.technest.backend.entity.Product;
import com.technest.backend.entity.Review;
import com.technest.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserAndProduct(User user, Product product);
    List<Review> findByProduct(Product product);
}
