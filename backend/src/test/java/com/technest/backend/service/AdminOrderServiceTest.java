package com.technest.backend.service;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminOrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminOrderService adminOrderService;

    private User adminUser;
    private User regularUser;
    private Order pendingOrder;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@test.com");
        adminUser.setRole("ADMIN");

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setEmail("user@test.com");
        regularUser.setRole("USER");

        pendingOrder = new Order();
        pendingOrder.setId(10L);
        pendingOrder.setUser(adminUser);
        pendingOrder.setStatus(OrderStatus.PENDING);
        pendingOrder.setTotalAmount(BigDecimal.valueOf(100));
        pendingOrder.setCreatedAt(LocalDateTime.now());
        pendingOrder.setItems(new ArrayList<>());
    }

    // -------------------------------------------------------
    // getAllOrders
    // -------------------------------------------------------

    @Test
    void getAllOrders_adminSuccess_returnsOrderList() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(pendingOrder));

        List<OrderDto> result = adminOrderService.getAllOrders("admin@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(10L);
        verify(orderRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getAllOrders_normalUser_throwsForbidden() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> adminOrderService.getAllOrders("user@test.com"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("admin role required");

        verify(orderRepository, never()).findAllByOrderByCreatedAtDesc();
    }

    // -------------------------------------------------------
    // updateOrderStatus
    // -------------------------------------------------------

    @Test
    void updateOrderStatus_orderNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminOrderService.updateOrderStatus("admin@test.com", 99L, OrderStatus.CONFIRMED))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void updateOrderStatus_validTransition_pendingToConfirmed_success() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.CONFIRMED);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orderRepository).save(pendingOrder);
    }

    @Test
    void updateOrderStatus_validTransition_pendingToCancelled_success() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.CANCELLED);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void updateOrderStatus_invalidTransition_pendingToShipped_throwsBadRequest() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.SHIPPED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition: PENDING → SHIPPED");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateOrderStatus_invalidTransition_deliveredToAnything_throwsBadRequest() {
        pendingOrder.setStatus(OrderStatus.DELIVERED);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.CANCELLED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition: DELIVERED → CANCELLED");
    }

    @Test
    void updateOrderStatus_invalidTransition_cancelledToAnything_throwsBadRequest() {
        pendingOrder.setStatus(OrderStatus.CANCELLED);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));

        assertThatThrownBy(() -> adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.PENDING))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition: CANCELLED → PENDING");
    }

    @Test
    void updateOrderStatus_nullStatus_throwsBadRequest() {
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> adminOrderService.updateOrderStatus("admin@test.com", 10L, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Status cannot be null");

        verify(orderRepository, never()).findById(any());
    }

    @Test
    void updateOrderStatus_confirmedToShipped_success() {
        pendingOrder.setStatus(OrderStatus.CONFIRMED);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.SHIPPED);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.SHIPPED);
    }

    @Test
    void updateOrderStatus_shippedToDelivered_success() {
        pendingOrder.setStatus(OrderStatus.SHIPPED);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(pendingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = adminOrderService.updateOrderStatus("admin@test.com", 10L, OrderStatus.DELIVERED);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.DELIVERED);
    }
}
