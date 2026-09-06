package com.technest.backend.service;

import com.technest.backend.dto.InventoryMovementDto;
import com.technest.backend.dto.StockAdjustmentRequest;
import com.technest.backend.entity.InventoryMovement;
import com.technest.backend.entity.MovementType;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.InventoryMovementRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public InventoryService(InventoryMovementRepository inventoryMovementRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository) {
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }
    }

    /**
     * Record an inventory movement during business transactions (e.g. SALE during checkout, RETURN during cancel).
     */
    public InventoryMovement recordMovement(Product product, int oldStock, int quantityChange,
                                           int newStock, MovementType movementType,
                                           String reason, String responsibleUser) {
        InventoryMovement movement = new InventoryMovement(
                product, oldStock, quantityChange, newStock,
                movementType != null ? movementType : MovementType.ADJUSTMENT,
                reason, responsibleUser != null ? responsibleUser : "SYSTEM"
        );
        return inventoryMovementRepository.save(movement);
    }

    /**
     * Adjust product stock relatively (+/-) as Admin.
     */
    public InventoryMovementDto adjustStock(String email, Long productId, StockAdjustmentRequest request) {
        requireAdmin(email);

        if (request == null || request.getQuantityChange() == null) {
            throw new BadRequestException("Quantity change is required");
        }
        if (request.getQuantityChange() == 0) {
            throw new BadRequestException("Quantity change cannot be zero");
        }

        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        int oldStock = product.getStock();
        int newStock = oldStock + request.getQuantityChange();

        if (newStock < 0) {
            throw new BadRequestException("Stock adjustment results in negative stock: " + newStock
                    + " (current: " + oldStock + ", adjustment: " + request.getQuantityChange() + ")");
        }

        product.setStock(newStock);
        productRepository.save(product);

        MovementType type = request.getMovementType() != null ? request.getMovementType() : MovementType.ADJUSTMENT;
        InventoryMovement movement = recordMovement(
                product, oldStock, request.getQuantityChange(), newStock,
                type, request.getReason(), email
        );

        return mapToDto(movement);
    }

    /**
     * Set absolute product stock as Admin.
     */
    public InventoryMovementDto updateStock(String email, Long productId, int absoluteStock, String reason) {
        requireAdmin(email);

        if (absoluteStock < 0) {
            throw new BadRequestException("Stock must not be negative. Received: " + absoluteStock);
        }

        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        int oldStock = product.getStock();
        int change = absoluteStock - oldStock;

        product.setStock(absoluteStock);
        productRepository.save(product);

        MovementType type = change >= 0 ? MovementType.RESTOCK : MovementType.ADJUSTMENT;
        InventoryMovement movement = recordMovement(
                product, oldStock, change, absoluteStock,
                type, reason != null ? reason : "Direct stock update", email
        );

        return mapToDto(movement);
    }

    @Transactional(readOnly = true)
    public Page<InventoryMovementDto> getProductMovements(String email, Long productId, Pageable pageable) {
        requireAdmin(email);
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementDto> getProductMovementsList(String email, Long productId) {
        requireAdmin(email);
        return inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryMovementDto> getAllMovements(String email, Pageable pageable) {
        requireAdmin(email);
        return inventoryMovementRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDto);
    }

    private InventoryMovementDto mapToDto(InventoryMovement m) {
        return new InventoryMovementDto(
                m.getId(),
                m.getProduct().getId(),
                m.getProduct().getName(),
                m.getOldStock(),
                m.getQuantityChange(),
                m.getNewStock(),
                m.getMovementType(),
                m.getReason(),
                m.getResponsibleUser(),
                m.getCreatedAt()
        );
    }
}
