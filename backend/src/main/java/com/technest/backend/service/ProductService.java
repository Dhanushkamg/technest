package com.technest.backend.service;

import com.technest.backend.dto.ProductResponse;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Product;
import com.technest.backend.repository.CategoryRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Product createProduct(Product product, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setCategory(category);
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    /**
     * Returns a flat ProductResponse DTO for the public GET /api/products/{id} endpoint.
     * This ensures the response matches the frontend Product type which expects
     * categoryId and categoryName as top-level fields, not a nested category object.
     */
    public ProductResponse getProductByIdAsDto(Long id) {
        Product p = getProductById(id);
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

    public Product updateProduct(Long id, Product productDetails, Long categoryId) {
        Product product = getProductById(id);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        product.setCategory(category);

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
