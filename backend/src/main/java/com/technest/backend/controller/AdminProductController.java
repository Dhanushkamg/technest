package com.technest.backend.controller;

import com.technest.backend.dto.AdjustStockRequest;
import com.technest.backend.dto.ProductRequest;
import com.technest.backend.dto.ProductResponse;
import com.technest.backend.dto.UpdateStockRequest;
import com.technest.backend.service.AdminProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    /**
     * GET /api/admin/products
     * Returns all products. ADMIN only.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        String email = getAuthenticatedUserEmail();
        return ResponseEntity.ok(adminProductService.getAllProducts(email));
    }

    /**
     * POST /api/admin/products
     * Creates a new product. ADMIN only.
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {
        String email = getAuthenticatedUserEmail();
        ProductResponse response = adminProductService.createProduct(email, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * PUT /api/admin/products/{id}
     * Updates an existing product. ADMIN only.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        String email = getAuthenticatedUserEmail();
        ProductResponse response = adminProductService.updateProduct(email, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/products/{id}/stock
     * Sets absolute product stock. ADMIN only.
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequest request) {
        String email = getAuthenticatedUserEmail();
        ProductResponse response = adminProductService.updateProductStock(email, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/products/{id}/stock/adjust
     * Adjusts product stock relatively (+/-). ADMIN only.
     */
    @PatchMapping("/{id}/stock/adjust")
    public ResponseEntity<ProductResponse> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody AdjustStockRequest request) {
        String email = getAuthenticatedUserEmail();
        ProductResponse response = adminProductService.adjustProductStock(email, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/products/{id}
     * Deletes a product. ADMIN only. Returns 404 if product does not exist.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        adminProductService.deleteProduct(email, id);
        return ResponseEntity.noContent().build();
    }
}
