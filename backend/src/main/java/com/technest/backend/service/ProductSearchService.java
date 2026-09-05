package com.technest.backend.service;

import com.technest.backend.dto.PagedProductResponse;
import com.technest.backend.dto.ProductResponse;
import com.technest.backend.entity.Product;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductSearchService {

    /** Maximum allowed page size to prevent abuse. */
    public static final int MAX_PAGE_SIZE = 100;

    /** Only these fields are safe for ORDER BY to prevent HQL injection. Maps lowercase to entity field names. */
    private static final Map<String, String> ALLOWED_SORT_FIELDS = Map.of(
            "id", "id",
            "name", "name",
            "price", "price",
            "stock", "stock",
            "createdat", "createdAt",
            "averagerating", "averageRating",
            "reviewcount", "reviewCount"
    );

    private final ProductRepository productRepository;

    public ProductSearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ---------------------------------------------------------
    // Main search method — called by ProductController
    // ---------------------------------------------------------

    @Transactional(readOnly = true)
    public PagedProductResponse search(
            String search,
            String category,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        // --- Validate inputs ---
        validatePage(page);
        validateSize(size);
        validatePriceRange(minPrice, maxPrice);
        validateMinRating(minRating);
        String validatedSortBy = validateSortField(sortBy);
        Sort.Direction direction = validateSortDirection(sortDirection);

        // --- Build Pageable ---
        Sort sort = Sort.by(direction, validatedSortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // --- Build Specification ---
        Specification<Product> spec = buildSpec(search, category, categoryId, minPrice, maxPrice, minRating);

        // --- Query ---
        Page<Product> resultPage = productRepository.findAll(spec, pageable);

        // --- Map to DTO ---
        List<ProductResponse> content = resultPage.getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PagedProductResponse(
                content,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isFirst(),
                resultPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PagedProductResponse search(
            String search,
            String category,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size,
            String sortBy,
            String sortDirection) {
        return search(search, category, categoryId, minPrice, maxPrice, null, page, size, sortBy, sortDirection);
    }

    @Transactional(readOnly = true)
    public PagedProductResponse search(
            String search,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        return search(search, null, categoryId, minPrice, maxPrice, null, page, size, sortBy, sortDir);
    }

    // ---------------------------------------------------------
    // Specification builder
    // ---------------------------------------------------------

    private Specification<Product> buildSpec(
            String search,
            String category,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + search.trim().toLowerCase() + "%"
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(
                        cb.lower(root.get("category").get("name")),
                        category.trim().toLowerCase()
                ));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // ---------------------------------------------------------
    // Validation helpers
    // ---------------------------------------------------------

    private void validatePage(int page) {
        if (page < 0) {
            throw new BadRequestException("Page number must not be negative. Received: " + page);
        }
    }

    private void validateSize(int size) {
        if (size <= 0) {
            throw new BadRequestException("Page size must be greater than 0. Received: " + size);
        }
        if (size > MAX_PAGE_SIZE) {
            throw new BadRequestException(
                    "Page size must not exceed " + MAX_PAGE_SIZE + ". Received: " + size);
        }
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("minPrice must not be negative. Received: " + minPrice);
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("maxPrice must not be negative. Received: " + maxPrice);
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException(
                    "minPrice (" + minPrice + ") must not be greater than maxPrice (" + maxPrice + ")");
        }
    }

    private void validateMinRating(Double minRating) {
        if (minRating != null && (minRating < 0.0 || minRating > 5.0)) {
            throw new BadRequestException("minRating must be between 0 and 5. Received: " + minRating);
        }
    }

    private String validateSortField(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "id"; // default
        }
        String key = sortBy.trim().toLowerCase();
        if (!ALLOWED_SORT_FIELDS.containsKey(key)) {
            throw new BadRequestException(
                    "Invalid sortBy field: '" + sortBy + "'. Allowed values: " + ALLOWED_SORT_FIELDS.values());
        }
        return ALLOWED_SORT_FIELDS.get(key);
    }

    private Sort.Direction validateSortDirection(String sortDir) {
        if (sortDir == null || sortDir.isBlank()) {
            return Sort.Direction.ASC; // default
        }
        return switch (sortDir.trim().toLowerCase()) {
            case "asc", "ascending"  -> Sort.Direction.ASC;
            case "desc", "descending" -> Sort.Direction.DESC;
            default -> throw new BadRequestException(
                    "Invalid sort direction: '" + sortDir + "'. Allowed values: asc, desc");
        };
    }

    // ---------------------------------------------------------
    // Mapping helper
    // ---------------------------------------------------------

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getAverageRating(),
                p.getReviewCount()
        );
    }
}
