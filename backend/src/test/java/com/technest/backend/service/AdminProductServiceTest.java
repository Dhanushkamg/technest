package com.technest.backend.service;

import com.technest.backend.dto.ProductRequest;
import com.technest.backend.dto.ProductResponse;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CategoryRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminProductServiceTest {

    @Mock private ProductRepository  productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository     userRepository;

    @InjectMocks
    private AdminProductService adminProductService;

    // ---- fixtures ----
    private User     admin;
    private User     regularUser;
    private Category category;
    private Product  product;
    private ProductRequest request;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1L);
        admin.setEmail("admin@test.com");
        admin.setRole("ADMIN");

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setEmail("user@test.com");
        regularUser.setRole("USER");

        category = new Category();
        category.setId(10L);
        category.setName("Electronics");

        product = new Product();
        product.setId(100L);
        product.setName("Laptop");
        product.setDescription("A laptop");
        product.setPrice(BigDecimal.valueOf(999.99));
        product.setStock(50);
        product.setCategory(category);

        request = new ProductRequest();
        request.setName("Laptop");
        request.setDescription("A laptop");
        request.setPrice(BigDecimal.valueOf(999.99));
        request.setStock(50);
        request.setCategoryId(10L);
    }

    // =========================================================
    // getAllProducts
    // =========================================================

    @Test
    void getAllProducts_adminSuccess_returnsList() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<ProductResponse> result = adminProductService.getAllProducts("admin@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Laptop");
        verify(productRepository).findAll();
    }

    @Test
    void getAllProducts_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminProductService.getAllProducts("user@test.com"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("admin role required");

        verify(productRepository, never()).findAll();
    }

    // =========================================================
    // createProduct
    // =========================================================

    @Test
    void createProduct_adminSuccess_returnsResponse() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        ProductResponse result = adminProductService.createProduct("admin@test.com", request);

        assertThat(result.getName()).isEqualTo("Laptop");
        assertThat(result.getCategoryId()).isEqualTo(10L);
        assertThat(result.getCategoryName()).isEqualTo("Electronics");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminProductService.createProduct("user@test.com", request))
                .isInstanceOf(ForbiddenException.class);

        verify(productRepository, never()).save(any());
    }

    @Test
    void createProduct_categoryNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.createProduct("admin@test.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found");

        verify(productRepository, never()).save(any());
    }

    // =========================================================
    // updateProduct
    // =========================================================

    @Test
    void updateProduct_adminSuccess_returnsUpdatedResponse() {
        request.setName("Gaming Laptop");
        request.setPrice(BigDecimal.valueOf(1499.99));

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse result = adminProductService.updateProduct("admin@test.com", 100L, request);

        assertThat(result.getName()).isEqualTo("Gaming Laptop");
        assertThat(result.getPrice()).isEqualByComparingTo("1499.99");
        verify(productRepository).save(product);
    }

    @Test
    void updateProduct_productNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.updateProduct("admin@test.com", 999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");

        verify(productRepository, never()).save(any());
    }

    @Test
    void updateProduct_categoryNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.updateProduct("admin@test.com", 100L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found");
    }

    // =========================================================
    // deleteProduct
    // =========================================================

    @Test
    void deleteProduct_adminSuccess_deletesProduct() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        adminProductService.deleteProduct("admin@test.com", 100L);

        verify(productRepository).delete(product);
    }

    @Test
    void deleteProduct_productNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.deleteProduct("admin@test.com", 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");

        verify(productRepository, never()).delete(any(Product.class));
    }

    @Test
    void deleteProduct_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminProductService.deleteProduct("user@test.com", 100L))
                .isInstanceOf(ForbiddenException.class);

        verify(productRepository, never()).delete(any(Product.class));
    }
}
