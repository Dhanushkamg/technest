package com.technest.backend.service;

import com.technest.backend.dto.ProductResponse;
import com.technest.backend.dto.ProductVariantDto;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.ProductImage;
import com.technest.backend.entity.ProductVariant;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CategoryRepository;
import com.technest.backend.repository.ProductImageRepository;
import com.technest.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(ProductRepository productRepository, 
                          CategoryRepository categoryRepository,
                          ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
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

    public Product getProductByIdOrSlug(String identifier) {
        try {
            Long id = Long.parseLong(identifier);
            return productRepository.findById(id)
                    .orElseGet(() -> productRepository.findBySlug(identifier)
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found with identifier: " + identifier)));
        } catch (NumberFormatException e) {
            return productRepository.findBySlug(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + identifier));
        }
    }

    /**
     * Returns a flat ProductResponse DTO for the public GET /api/products/{id} endpoint.
     * This ensures the response matches the frontend Product type which expects
     * categoryId and categoryName as top-level fields, not a nested category object.
     */
    public ProductResponse getProductByIdOrSlugAsDto(String identifier) {
        Product p = getProductByIdOrSlug(identifier);
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(p.getId());
        List<String> imageUrls = images.stream().map(ProductImage::getUrl).collect(Collectors.toList());
        
        ProductResponse response = new ProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getAverageRating(),
                p.getReviewCount()
        );
        response.setImages(imageUrls);
        
        List<ProductVariantDto> variantDtos = new ArrayList<>();
        if (p.getVariants() != null) {
            for (ProductVariant v : p.getVariants()) {
                variantDtos.add(new ProductVariantDto(
                    v.getId(),
                    v.getColor(),
                    v.getSize(),
                    v.getSku(),
                    v.getStock(),
                    v.getPriceOverride()
                ));
            }
        }
        response.setVariants(variantDtos);
        
        return response;
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
