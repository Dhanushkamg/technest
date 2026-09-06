package com.technest.backend.controller;

import com.technest.backend.dto.InventoryMovementDto;
import com.technest.backend.dto.StockAdjustmentRequest;
import com.technest.backend.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    public AdminInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/movements")
    public ResponseEntity<Page<InventoryMovementDto>> getAllMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = getAuthenticatedUserEmail();
        Page<InventoryMovementDto> result = inventoryService.getAllMovements(
                email, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products/{productId}/movements")
    public ResponseEntity<List<InventoryMovementDto>> getProductMovements(
            @PathVariable Long productId) {
        String email = getAuthenticatedUserEmail();
        List<InventoryMovementDto> result = inventoryService.getProductMovementsList(email, productId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/adjust")
    public ResponseEntity<InventoryMovementDto> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request) {
        String email = getAuthenticatedUserEmail();
        InventoryMovementDto result = inventoryService.adjustStock(email, request.getProductId(), request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/products/{productId}/adjust")
    public ResponseEntity<InventoryMovementDto> adjustProductStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        String email = getAuthenticatedUserEmail();
        request.setProductId(productId);
        InventoryMovementDto result = inventoryService.adjustStock(email, productId, request);
        return ResponseEntity.ok(result);
    }
}
