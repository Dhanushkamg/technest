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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository  productRepository;
    private final UserRepository     userRepository;

    public AdminCategoryService(CategoryRepository categoryRepository,
                                ProductRepository productRepository,
                                UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository  = productRepository;
        this.userRepository     = userRepository;
    }

    // ---------------------------------------------------------
    // ADMIN guard — reused by every public method
    // ---------------------------------------------------------

    private void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }
    }

    // ---------------------------------------------------------
    // GET all categories
    // ---------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(String email) {
        requireAdmin(email);
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // CREATE category
    // ---------------------------------------------------------

    @Transactional
    public CategoryResponse createCategory(String email, CategoryRequest request) {
        requireAdmin(email);

        Category category = new Category();
        category.setName(request.getName().trim());

        return toResponse(categoryRepository.save(category));
    }

    // ---------------------------------------------------------
    // UPDATE category
    // ---------------------------------------------------------

    @Transactional
    public CategoryResponse updateCategory(String email, Long categoryId, CategoryRequest request) {
        requireAdmin(email);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId));

        category.setName(request.getName().trim());
        return toResponse(categoryRepository.save(category));
    }

    // ---------------------------------------------------------
    // DELETE category
    // ---------------------------------------------------------

    @Transactional
    public void deleteCategory(String email, Long categoryId) {
        requireAdmin(email);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId));

        // Guard against FK violation: check if any products still reference this category.
        // Without this check, PostgreSQL raises DataIntegrityViolationException → 500.
        if (productRepository.existsByCategoryId(categoryId)) {
            throw new BadRequestException(
                    "Cannot delete category '" + category.getName()
                            + "': it is still assigned to one or more products. "
                            + "Re-assign or delete those products first.");
        }

        categoryRepository.delete(category);
    }

    // ---------------------------------------------------------
    // Mapping helper
    // ---------------------------------------------------------

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName());
    }
}
