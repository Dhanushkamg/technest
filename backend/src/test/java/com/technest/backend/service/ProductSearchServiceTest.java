package com.technest.backend.service;

import com.technest.backend.dto.PagedProductResponse;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Product;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductSearchServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductSearchService productSearchService;

    private Product product1;
    private Product product2;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Electronics");

        product1 = new Product();
        product1.setId(1L);
        product1.setName("iPhone 15");
        product1.setDescription("Apple smartphone");
        product1.setPrice(BigDecimal.valueOf(999.99));
        product1.setStock(50);
        product1.setCategory(category);
        product1.setAverageRating(4.8);
        product1.setReviewCount(120);
        product1.setCreatedAt(LocalDateTime.now().minusDays(2));

        product2 = new Product();
        product2.setId(2L);
        product2.setName("Samsung Galaxy");
        product2.setDescription("Android smartphone");
        product2.setPrice(BigDecimal.valueOf(799.99));
        product2.setStock(30);
        product2.setCategory(category);
        product2.setAverageRating(4.5);
        product2.setReviewCount(85);
        product2.setCreatedAt(LocalDateTime.now().minusDays(1));
    }

    @SuppressWarnings("unchecked")
    private void mockRepoPage(List<Product> products, int pageNumber, int pageSize, long totalElements) {
        Page<Product> page = new PageImpl<>(products, PageRequest.of(pageNumber, pageSize), totalElements);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
    }

    // =========================================================
    // 1. Pagination & Metadata
    // =========================================================

    @Test
    void search_defaultPagination_returnsProperMetadata() {
        mockRepoPage(List.of(product1, product2), 0, 10, 2);

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, null, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getPage()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(10);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.isFirst()).isTrue();
        assertThat(result.isLast()).isTrue();
    }

    @Test
    void search_customPageAndSize_works() {
        mockRepoPage(List.of(product2), 1, 1, 2);

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, null, 1, 1, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getPage()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(1);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.isFirst()).isFalse();
        assertThat(result.isLast()).isTrue();
    }

    @Test
    void search_emptyResults_returnsEmptyPage() {
        mockRepoPage(Collections.emptyList(), 0, 10, 0);

        PagedProductResponse result = productSearchService.search(
                "nonexistent", null, null, null, null, 0, 10, "id", "asc");

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isEqualTo(0);
        assertThat(result.getTotalPages()).isEqualTo(0);
    }

    // =========================================================
    // 2. Name Search
    // =========================================================

    @Test
    void search_withSearchTerm_returnsFilteredResults() {
        mockRepoPage(List.of(product1), 0, 10, 1);

        PagedProductResponse result = productSearchService.search(
                "iphone", null, null, null, null, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("iPhone 15");
    }

    @Test
    void search_caseInsensitiveAndTrimmedSearch_works() {
        mockRepoPage(List.of(product1), 0, 10, 1);

        PagedProductResponse result = productSearchService.search(
                "   IPHONE   ", null, null, null, null, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("iPhone 15");
    }

    // =========================================================
    // 3. Category Filtering
    // =========================================================

    @Test
    void search_withCategoryName_filtersCorrectly() {
        mockRepoPage(List.of(product1, product2), 0, 10, 2);

        PagedProductResponse result = productSearchService.search(
                null, "Electronics", null, null, null, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void search_withCategoryId_filtersCorrectly() {
        mockRepoPage(List.of(product1, product2), 0, 10, 2);

        PagedProductResponse result = productSearchService.search(
                null, null, 1L, null, null, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(2);
    }

    // =========================================================
    // 4. Price Range Filtering
    // =========================================================

    @Test
    void search_minPriceFilter_works() {
        mockRepoPage(List.of(product1), 0, 10, 1);

        PagedProductResponse result = productSearchService.search(
                null, null, null, BigDecimal.valueOf(900), null, 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_maxPriceFilter_works() {
        mockRepoPage(List.of(product2), 0, 10, 1);

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, BigDecimal.valueOf(800), 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_combinedPriceRange_works() {
        mockRepoPage(List.of(product2), 0, 10, 1);

        PagedProductResponse result = productSearchService.search(
                null, null, null, BigDecimal.valueOf(500), BigDecimal.valueOf(850), 0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
    }

    // =========================================================
    // 5. Sorting
    // =========================================================

    @Test
    void search_sortingAscending_byPrice() {
        mockRepoPage(List.of(product2, product1), 0, 10, 2);

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, null, 0, 10, "price", "asc");

        assertThat(result.getContent()).hasSize(2);
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void search_sortingDescending_byName() {
        mockRepoPage(List.of(product2, product1), 0, 10, 2);

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, null, 0, 10, "name", "desc");

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void search_sortingByCreatedAtAndAverageRating_works() {
        mockRepoPage(List.of(product1, product2), 0, 10, 2);

        PagedProductResponse result1 = productSearchService.search(
                null, null, null, null, null, 0, 10, "createdAt", "desc");
        assertThat(result1.getContent()).hasSize(2);

        PagedProductResponse result2 = productSearchService.search(
                null, null, null, null, null, 0, 10, "averageRating", "desc");
        assertThat(result2.getContent()).hasSize(2);
    }

    @Test
    void search_combinedAllFilters_works() {
        mockRepoPage(List.of(product1), 0, 10, 1);

        PagedProductResponse result = productSearchService.search(
                "iphone", "Electronics", 1L, BigDecimal.valueOf(900), BigDecimal.valueOf(1100), 0, 10, "price", "desc");

        assertThat(result.getContent()).hasSize(1);
    }

    // =========================================================
    // 6. Validation Errors
    // =========================================================

    @Test
    void search_negativePage_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, null, -1, 10, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page number must not be negative");
    }

    @Test
    void search_zeroOrNegativeSize_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, null, 0, 0, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page size must be greater than 0");

        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, null, 0, -5, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page size must be greater than 0");
    }

    @Test
    void search_sizeAboveMaximum_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, null, 0, ProductSearchService.MAX_PAGE_SIZE + 1, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must not exceed");
    }

    @Test
    void search_negativeMinPrice_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, BigDecimal.valueOf(-10), null, 0, 10, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("minPrice must not be negative");
    }

    @Test
    void search_negativeMaxPrice_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, BigDecimal.valueOf(-50), 0, 10, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("maxPrice must not be negative");
    }

    @Test
    void search_minPriceGreaterThanMaxPrice_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, BigDecimal.valueOf(1000), BigDecimal.valueOf(500), 0, 10, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("minPrice")
                .hasMessageContaining("maxPrice");
    }

    @Test
    void search_invalidSortField_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, null, 0, 10, "secretField", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sortBy field");
    }

    @Test
    void search_invalidSortDirection_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, null, 0, 10, "price", "sideways"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sort direction");
    }
}
