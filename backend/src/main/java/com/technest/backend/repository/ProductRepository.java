package com.technest.backend.repository;

import com.technest.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Used by AdminCategoryService to check if any products reference a category
     * before attempting deletion, to return a clean 400 instead of a 500 FK violation.
     */
    boolean existsByCategoryId(Long categoryId);
}
