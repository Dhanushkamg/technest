package com.technest.backend.controller;

import com.technest.backend.dto.PagedProductResponse;
import com.technest.backend.entity.Product;
import com.technest.backend.service.ProductSearchService;
import com.technest.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService       productService;
    private final ProductSearchService productSearchService;

    public ProductController(ProductService productService,
                             ProductSearchService productSearchService) {
        this.productService       = productService;
        this.productSearchService = productSearchService;
    }

    /**
     * GET /api/products
     * Supports optional query parameters for search, filter, pagination, and sorting.
     * Backward compatible — calling with no parameters returns page 0, size 20, sorted by id asc.
     *
     * @param search     case-insensitive name search
     * @param categoryId filter by category
     * @param minPrice   minimum price (inclusive)
     * @param maxPrice   maximum price (inclusive)
     * @param page       zero-based page number (default 0)
     * @param size       page size 1-100 (default 20)
     * @param sortBy     field to sort by: id, name, price, stock (default id)
     * @param sortDir    sort direction: asc, desc (default asc)
     */
    @GetMapping
    public ResponseEntity<PagedProductResponse> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        PagedProductResponse result = productSearchService.search(
                search, categoryId, minPrice, maxPrice, page, size, sortBy, sortDir);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product,
            @RequestParam Long categoryId) {
        Product createdProduct = productService.createProduct(product, categoryId);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestParam Long categoryId) {
        Product updatedProduct = productService.updateProduct(id, product, categoryId);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}