package com.technest.backend.service;

import com.technest.backend.dto.AdjustStockRequest;
import com.technest.backend.dto.ProductRequest;
import com.technest.backend.dto.ProductResponse;
import com.technest.backend.dto.UpdateStockRequest;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.Product;
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
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;

    public AdminProductService(ProductRepository productRepository,
                               CategoryRepository categoryRepository,
                               UserRepository userRepository,
                               InventoryService inventoryService) {
        this.productRepository  = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository     = userRepository;
        this.inventoryService   = inventoryService;
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

        if (request == null) {
            throw new BadRequestException("Product payload is required");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        if (request.getPrice() != null && request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Price must not be negative");
        }
        if (request.getStock() != null && request.getStock() < 0) {
            throw new BadRequestException("Stock must not be negative");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock() != null ? request.getStock() : 0);
        product.setCategory(category);

        Product saved = productRepository.save(product);
        if (saved.getStock() > 0) {
            inventoryService.recordMovement(
                    saved, 0, saved.getStock(), saved.getStock(),
                    com.technest.backend.entity.MovementType.PURCHASE,
                    "Initial product creation", email
            );
        }

        return toResponse(saved);
    }

    // ---------------------------------------------------------
    // UPDATE product
    // ---------------------------------------------------------

    @Transactional
    public ProductResponse updateProduct(String email, Long productId, ProductRequest request) {
        requireAdmin(email);

        if (request == null) {
            throw new BadRequestException("Product payload is required");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + productId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        if (request.getPrice() != null && request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Price must not be negative");
        }
        if (request.getStock() != null && request.getStock() < 0) {
            throw new BadRequestException("Stock must not be negative");
        }

        int oldStock = product.getStock();
        int newStock = request.getStock() != null ? request.getStock() : oldStock;

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(newStock);
        product.setCategory(category);

        Product saved = productRepository.save(product);

        if (newStock != oldStock) {
            int diff = newStock - oldStock;
            inventoryService.recordMovement(
                    saved, oldStock, diff, newStock,
                    diff > 0 ? com.technest.backend.entity.MovementType.RESTOCK : com.technest.backend.entity.MovementType.ADJUSTMENT,
                    "Product edit stock change", email
            );
        }

        return toResponse(saved);
    }

    // ---------------------------------------------------------
    // UPDATE product stock directly
    // ---------------------------------------------------------

    @Transactional
    public ProductResponse updateProductStock(String email, Long productId, UpdateStockRequest request) {
        requireAdmin(email);

        if (request == null || request.getStock() == null) {
            throw new BadRequestException("Stock value is required");
        }
        if (request.getStock() < 0) {
            throw new BadRequestException("Stock must not be negative. Received: " + request.getStock());
        }

        inventoryService.updateStock(email, productId, request.getStock(), "Admin direct stock update");
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        return toResponse(product);
    }

    // ---------------------------------------------------------
    // ADJUST product stock relatively (+/-)
    // ---------------------------------------------------------

    @Transactional
    public ProductResponse adjustProductStock(String email, Long productId, AdjustStockRequest request) {
        requireAdmin(email);

        if (request == null || request.getQuantity() == null) {
            throw new BadRequestException("Adjustment quantity is required");
        }

        com.technest.backend.dto.StockAdjustmentRequest sar = new com.technest.backend.dto.StockAdjustmentRequest(
                productId, request.getQuantity(), request.getMovementType(), request.getReason()
        );
        inventoryService.adjustStock(email, productId, sar);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        return toResponse(product);
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
                p.getCategory().getName(),
                p.getAverageRating(),
                p.getReviewCount()
        );
    }
}
