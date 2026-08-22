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
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
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

        product2 = new Product();
        product2.setId(2L);
        product2.setName("Samsung Galaxy");
        product2.setDescription("Android smartphone");
        product2.setPrice(BigDecimal.valueOf(799.99));
        product2.setStock(30);
        product2.setCategory(category);
    }

    @SuppressWarnings("unchecked")
    private void mockRepoPage(List<Product> products) {
        Page<Product> page = new PageImpl<>(products);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
    }

    // =========================================================
    // Pagination success
    // =========================================================

    @Test
    void search_noFilters_returnsPaginatedResults() {
        mockRepoPage(List.of(product1, product2));

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, 0, 20, "id", "asc");

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getPage()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    @Test
    void search_withSearchTerm_returnsFilteredResults() {
        mockRepoPage(List.of(product1));

        PagedProductResponse result = productSearchService.search(
                "iphone", null, null, null, 0, 20, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("iPhone 15");
    }

    @Test
    void search_caseInsensitiveSearch_works() {
        mockRepoPage(List.of(product1));

        // Spec built with lower() so both "IPHONE" and "iphone" produce the same predicate
        PagedProductResponse result = productSearchService.search(
                "IPHONE", null, null, null, 0, 20, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_withCategoryId_filtersCorrectly() {
        mockRepoPage(List.of(product1, product2));

        PagedProductResponse result = productSearchService.search(
                null, 1L, null, null, 0, 20, "id", "asc");

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void search_priceRangeFilter_works() {
        mockRepoPage(List.of(product2));

        PagedProductResponse result = productSearchService.search(
                null, null, BigDecimal.valueOf(500), BigDecimal.valueOf(850), 0, 20, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_combinedFilters_work() {
        mockRepoPage(List.of(product1));

        PagedProductResponse result = productSearchService.search(
                "iphone", 1L, BigDecimal.valueOf(900), BigDecimal.valueOf(1100), 0, 10, "price", "desc");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_sortingAscending_works() {
        mockRepoPage(List.of(product2, product1));

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, 0, 20, "price", "asc");

        assertThat(result.getContent()).hasSize(2);
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void search_sortingDescending_works() {
        mockRepoPage(List.of(product1, product2));

        PagedProductResponse result = productSearchService.search(
                null, null, null, null, 0, 20, "price", "desc");

        assertThat(result.getContent()).hasSize(2);
    }

    // =========================================================
    // Validation errors
    // =========================================================

    @Test
    void search_minPriceGreaterThanMaxPrice_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, BigDecimal.valueOf(1000), BigDecimal.valueOf(500), 0, 20, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("minPrice")
                .hasMessageContaining("maxPrice");

        verify(productRepository, never()).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void search_negativePage_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, -1, 20, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page number must not be negative");
    }

    @Test
    void search_zeroSize_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, 0, 0, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page size must be greater than 0");
    }

    @Test
    void search_sizeAboveMaximum_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, 0, ProductSearchService.MAX_PAGE_SIZE + 1, "id", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must not exceed");
    }

    @Test
    void search_invalidSortField_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, 0, 20, "password", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sortBy field");

        verify(productRepository, never()).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void search_invalidSortDirection_throwsBadRequest() {
        assertThatThrownBy(() -> productSearchService.search(
                null, null, null, null, 0, 20, "price", "sideways"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sortDir");

        verify(productRepository, never()).findAll(any(Specification.class), any(Pageable.class));
    }
}
