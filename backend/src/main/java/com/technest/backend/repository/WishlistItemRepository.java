package com.technest.backend.repository;

import com.technest.backend.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser_Email(String email);
    Optional<WishlistItem> findByUser_EmailAndProduct_Id(String email, Long productId);
    boolean existsByUser_EmailAndProduct_Id(String email, Long productId);
}
