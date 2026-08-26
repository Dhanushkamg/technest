package com.technest.backend.controller;

import com.technest.backend.dto.CategoryRequest;
import com.technest.backend.dto.CategoryResponse;
import com.technest.backend.service.AdminCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    public AdminCategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    /**
     * GET /api/admin/categories
     * Returns all categories. ADMIN only.
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        String email = getAuthenticatedUserEmail();
        return ResponseEntity.ok(adminCategoryService.getAllCategories(email));
    }

    /**
     * POST /api/admin/categories
     * Creates a new category. ADMIN only.
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        String email = getAuthenticatedUserEmail();
        CategoryResponse response = adminCategoryService.createCategory(email, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * PUT /api/admin/categories/{id}
     * Updates an existing category name. ADMIN only.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        String email = getAuthenticatedUserEmail();
        CategoryResponse response = adminCategoryService.updateCategory(email, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/categories/{id}
     * Deletes a category. ADMIN only.
     * Returns 404 if not found.
     * Returns 400 if products still reference this category.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        adminCategoryService.deleteCategory(email, id);
        return ResponseEntity.noContent().build();
    }
}
