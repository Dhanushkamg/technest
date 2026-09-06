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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryMovementRepository inventoryMovementRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private User adminUser;
    private User normalUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setEmail("admin@example.com");
        adminUser.setRole("ADMIN");

        normalUser = new User();
        normalUser.setEmail("user@example.com");
        normalUser.setRole("USER");

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Wireless Mouse");
        testProduct.setPrice(new BigDecimal("29.99"));
        testProduct.setStock(20);
    }

    @Test
    void adjustStock_positiveAdjustment_success() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testProduct));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> {
            InventoryMovement m = i.getArgument(0);
            m.setId(100L);
            return m;
        });

        StockAdjustmentRequest request = new StockAdjustmentRequest(1L, 10, MovementType.RESTOCK, "Restocked shipment");
        InventoryMovementDto result = inventoryService.adjustStock("admin@example.com", 1L, request);

        assertThat(result).isNotNull();
        assertThat(result.getOldStock()).isEqualTo(20);
        assertThat(result.getQuantityChange()).isEqualTo(10);
        assertThat(result.getNewStock()).isEqualTo(30);
        assertThat(result.getMovementType()).isEqualTo(MovementType.RESTOCK);
        assertThat(result.getReason()).isEqualTo("Restocked shipment");
        assertThat(testProduct.getStock()).isEqualTo(30);
    }

    @Test
    void adjustStock_negativeAdjustment_success() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testProduct));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> i.getArgument(0));

        StockAdjustmentRequest request = new StockAdjustmentRequest(1L, -5, MovementType.DAMAGE, "Damaged in transit");
        InventoryMovementDto result = inventoryService.adjustStock("admin@example.com", 1L, request);

        assertThat(result.getOldStock()).isEqualTo(20);
        assertThat(result.getQuantityChange()).isEqualTo(-5);
        assertThat(result.getNewStock()).isEqualTo(15);
        assertThat(result.getMovementType()).isEqualTo(MovementType.DAMAGE);
        assertThat(testProduct.getStock()).isEqualTo(15);
    }

    @Test
    void adjustStock_negativeResultingStock_throwsBadRequest() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testProduct));

        StockAdjustmentRequest request = new StockAdjustmentRequest(1L, -25, MovementType.ADJUSTMENT, "Excess subtraction");
        assertThatThrownBy(() -> inventoryService.adjustStock("admin@example.com", 1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("results in negative stock");

        verify(inventoryMovementRepository, never()).save(any());
        assertThat(testProduct.getStock()).isEqualTo(20);
    }

    @Test
    void adjustStock_zeroQuantity_throwsBadRequest() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        StockAdjustmentRequest request = new StockAdjustmentRequest(1L, 0, MovementType.ADJUSTMENT, "Zero change");
        assertThatThrownBy(() -> inventoryService.adjustStock("admin@example.com", 1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be zero");
    }

    @Test
    void adjustStock_nonAdmin_throwsForbidden() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(normalUser));

        StockAdjustmentRequest request = new StockAdjustmentRequest(1L, 5, MovementType.ADJUSTMENT, "Audit");
        assertThatThrownBy(() -> inventoryService.adjustStock("user@example.com", 1L, request))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void updateStock_validAbsoluteStock_success() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(productRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testProduct));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> i.getArgument(0));

        InventoryMovementDto result = inventoryService.updateStock("admin@example.com", 1L, 50, "Full count");

        assertThat(result.getOldStock()).isEqualTo(20);
        assertThat(result.getQuantityChange()).isEqualTo(30);
        assertThat(result.getNewStock()).isEqualTo(50);
        assertThat(testProduct.getStock()).isEqualTo(50);
    }

    @Test
    void updateStock_negativeStock_throwsBadRequest() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> inventoryService.updateStock("admin@example.com", 1L, -1, "Invalid"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must not be negative");
    }

    @Test
    void getProductMovements_returnsMovements() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(productRepository.existsById(1L)).thenReturn(true);

        InventoryMovement movement = new InventoryMovement(testProduct, 10, 10, 20, MovementType.RESTOCK, "Restock", "admin@example.com");
        when(inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(eq(1L), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(movement)));

        Page<InventoryMovementDto> page = inventoryService.getProductMovements("admin@example.com", 1L, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getProductName()).isEqualTo("Wireless Mouse");
    }
}
