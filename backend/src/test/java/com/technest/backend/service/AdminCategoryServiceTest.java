package com.technest.backend.service;

import com.technest.backend.dto.CategoryRequest;
import com.technest.backend.dto.CategoryResponse;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminCategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private ProductRepository  productRepository;
    @Mock private UserRepository     userRepository;

    @InjectMocks
    private AdminCategoryService adminCategoryService;

    // ---- fixtures ----
    private User     admin;
    private User     regularUser;
    private Category category;
    private CategoryRequest request;

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
        category.setId(5L);
        category.setName("Electronics");

        request = new CategoryRequest();
        request.setName("Electronics");
    }

    // =========================================================
    // getAllCategories
    // =========================================================

    @Test
    void getAllCategories_adminSuccess_returnsList() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> result = adminCategoryService.getAllCategories("admin@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Electronics");
        verify(categoryRepository).findAll();
    }

    @Test
    void getAllCategories_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminCategoryService.getAllCategories("user@test.com"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("admin role required");

        verify(categoryRepository, never()).findAll();
    }

    // =========================================================
    // createCategory
    // =========================================================

    @Test
    void createCategory_adminSuccess_returnsResponse() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(5L);
            return c;
        });

        CategoryResponse result = adminCategoryService.createCategory("admin@test.com", request);

        assertThat(result.getName()).isEqualTo("Electronics");
        assertThat(result.getId()).isEqualTo(5L);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminCategoryService.createCategory("user@test.com", request))
                .isInstanceOf(ForbiddenException.class);

        verify(categoryRepository, never()).save(any());
    }

    // =========================================================
    // updateCategory
    // =========================================================

    @Test
    void updateCategory_adminSuccess_returnsUpdated() {
        request.setName("Home Appliances");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoryResponse result = adminCategoryService.updateCategory("admin@test.com", 5L, request);

        assertThat(result.getName()).isEqualTo("Home Appliances");
        verify(categoryRepository).save(category);
    }

    @Test
    void updateCategory_categoryNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCategoryService.updateCategory("admin@test.com", 999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found");

        verify(categoryRepository, never()).save(any());
    }

    // =========================================================
    // deleteCategory
    // =========================================================

    @Test
    void deleteCategory_adminSuccess_deletesCategory() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(5L)).thenReturn(false);

        adminCategoryService.deleteCategory("admin@test.com", 5L);

        verify(categoryRepository).delete(category);
    }

    @Test
    void deleteCategory_categoryNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCategoryService.deleteCategory("admin@test.com", 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found");

        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void deleteCategory_hasAssociatedProducts_throwsBadRequest() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(5L)).thenReturn(true);

        assertThatThrownBy(() -> adminCategoryService.deleteCategory("admin@test.com", 5L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete category")
                .hasMessageContaining("still assigned to one or more products");

        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void deleteCategory_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminCategoryService.deleteCategory("user@test.com", 5L))
                .isInstanceOf(ForbiddenException.class);

        verify(categoryRepository, never()).delete(any());
    }
}
