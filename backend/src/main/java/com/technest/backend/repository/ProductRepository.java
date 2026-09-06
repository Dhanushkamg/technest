package com.technest.backend.repository;

import com.technest.backend.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    /**
     * Used by AdminCategoryService to check if any products reference a category
     * before attempting deletion, to return a clean 400 instead of a 500 FK violation.
     */
    boolean existsByCategoryId(Long categoryId);

    /**
     * Pessimistic write lock on product row to prevent race conditions / overselling
     * during concurrent checkouts.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

    /**
     * Dashboard: count products with stock at or below the given threshold.
     */
    long countByStockLessThanEqual(int threshold);

    /**
     * Dashboard: count products with exact stock (e.g. 0 for out-of-stock).
     */
    long countByStock(int stock);
}
