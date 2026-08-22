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
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductSearchService {

    /** Maximum allowed page size to prevent abuse. */
    public static final int MAX_PAGE_SIZE = 100;

    /** Only these fields are safe for ORDER BY to prevent HQL injection. */
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price", "stock");

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
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        // --- Validate inputs ---
        validatePage(page);
        validateSize(size);
        validatePriceRange(minPrice, maxPrice);
        String validatedSortBy  = validateSortField(sortBy);
        Sort.Direction direction = validateSortDirection(sortDir);

        // --- Build Pageable ---
        Sort sort     = Sort.by(direction, validatedSortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // --- Build Specification ---
        Specification<Product> spec = buildSpec(search, categoryId, minPrice, maxPrice);

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

    // ---------------------------------------------------------
    // Specification builder
    // ---------------------------------------------------------

    private Specification<Product> buildSpec(
            String search,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + search.trim().toLowerCase() + "%"
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
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException(
                    "minPrice (" + minPrice + ") must not be greater than maxPrice (" + maxPrice + ")");
        }
    }

    private String validateSortField(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "id"; // default
        }
        String lower = sortBy.trim().toLowerCase();
        if (!ALLOWED_SORT_FIELDS.contains(lower)) {
            throw new BadRequestException(
                    "Invalid sortBy field: '" + sortBy + "'. Allowed values: " + ALLOWED_SORT_FIELDS);
        }
        return lower;
    }

    private Sort.Direction validateSortDirection(String sortDir) {
        if (sortDir == null || sortDir.isBlank()) {
            return Sort.Direction.ASC; // default
        }
        return switch (sortDir.trim().toLowerCase()) {
            case "asc"  -> Sort.Direction.ASC;
            case "desc" -> Sort.Direction.DESC;
            default -> throw new BadRequestException(
                    "Invalid sortDir: '" + sortDir + "'. Allowed values: asc, desc");
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
