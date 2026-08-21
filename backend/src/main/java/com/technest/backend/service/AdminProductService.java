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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public AdminProductService(ProductRepository productRepository,
                               CategoryRepository categoryRepository,
                               UserRepository userRepository) {
        this.productRepository  = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository     = userRepository;
    }

    // ---------------------------------------------------------
    // ADMIN guard — reused by every method
    // ---------------------------------------------------------

    private void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }
    }

    // ---------------------------------------------------------
    // GET all products (admin view — same data, clean DTO)
    // ---------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(String email) {
        requireAdmin(email);
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // CREATE product
    // ---------------------------------------------------------

    @Transactional
    public ProductResponse createProduct(String email, ProductRequest request) {
        requireAdmin(email);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        return toResponse(productRepository.save(product));
    }

    // ---------------------------------------------------------
    // UPDATE product
    // ---------------------------------------------------------

    @Transactional
    public ProductResponse updateProduct(String email, Long productId, ProductRequest request) {
        requireAdmin(email);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + productId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        return toResponse(productRepository.save(product));
    }

    // ---------------------------------------------------------
    // DELETE product
    // ---------------------------------------------------------

    @Transactional
    public void deleteProduct(String email, Long productId) {
        requireAdmin(email);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + productId));

        productRepository.delete(product);
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
                p.getCategory().getName()
        );
    }
}
