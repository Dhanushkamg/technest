package com.technest.backend.service;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.entity.Category;
import com.technest.backend.entity.NotificationType;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Payment;
import com.technest.backend.entity.PaymentStatus;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.AddressRepository;
import com.technest.backend.repository.CartRepository;
import com.technest.backend.repository.CouponRepository;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.PaymentRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderCancellationServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartRepository cartRepository;
    @Mock private ProductRepository productRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private NotificationService notificationService;
    @Mock private CouponRepository couponRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private User otherCustomer;
    private User admin;
    private Product product1;
    private Product product2;
    private Order order;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(10L);
        customer.setEmail("customer@test.com");
        customer.setRole("USER");

        otherCustomer = new User();
        otherCustomer.setId(20L);
        otherCustomer.setEmail("other@test.com");
        otherCustomer.setRole("USER");

        admin = new User();
        admin.setId(30L);
        admin.setEmail("admin@test.com");
        admin.setRole("ADMIN");

        Category category = new Category();
        category.setId(1L);
        category.setName("Electronics");

        product1 = new Product();
        product1.setId(100L);
        product1.setName("Laptop");
        product1.setPrice(BigDecimal.valueOf(1000));
        product1.setStock(5);
        product1.setCategory(category);

        product2 = new Product();
        product2.setId(50L); // Smaller ID to test sorting
        product2.setName("Mouse");
        product2.setPrice(BigDecimal.valueOf(50));
        product2.setStock(20);
        product2.setCategory(category);

        order = new Order();
        order.setId(1L);
        order.setUser(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.valueOf(1100));
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        OrderItem item1 = new OrderItem();
        item1.setId(1L);
        item1.setOrder(order);
        item1.setProduct(product1);
        item1.setProductName(product1.getName());
        item1.setPrice(product1.getPrice());
        item1.setQuantity(1);
        item1.setSubtotal(BigDecimal.valueOf(1000));
        order.addItem(item1);

        OrderItem item2 = new OrderItem();
        item2.setId(2L);
        item2.setOrder(order);
        item2.setProduct(product2);
        item2.setProductName(product2.getName());
        item2.setPrice(product2.getPrice());
        item2.setQuantity(2);
        item2.setSubtotal(BigDecimal.valueOf(100));
        order.addItem(item2);
    }

    // =========================================================
    // Customer Order Cancellation Tests
    // =========================================================

    @Test
    void customerCancel_pendingOrder_noPayment_success() {
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithLock(50L)).thenReturn(Optional.of(product2));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product1));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of());
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.cancelOrder("customer@test.com", 1L);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        // Verify stock restoration
        assertThat(product1.getStock()).isEqualTo(6); // 5 + 1
        assertThat(product2.getStock()).isEqualTo(22); // 20 + 2

        // Verify notification triggered
        verify(notificationService).createNotification(
                eq(customer),
                eq(NotificationType.ORDER_CANCELLED),
                contains("Your order #1 has been cancelled.")
        );
        verify(notificationService, never()).createNotification(any(), eq(NotificationType.REFUND_PROCESSED), any());
    }

    @Test
    void customerCancel_confirmedOrder_withSuccessfulPayment_processesRefund() {
        order.setStatus(OrderStatus.CONFIRMED);

        Payment payment = new Payment();
        payment.setId(99L);
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.SUCCESS);

        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithLock(50L)).thenReturn(Optional.of(product2));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product1));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of(payment));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.cancelOrder("customer@test.com", 1L);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        verify(paymentRepository).save(payment);

        // Verify refund and cancellation notifications
        verify(notificationService).createNotification(
                eq(customer),
                eq(NotificationType.REFUND_PROCESSED),
                contains("Refund of 1100 for order #1 has been processed.")
        );
        verify(notificationService).createNotification(
                eq(customer),
                eq(NotificationType.ORDER_CANCELLED),
                contains("Your order #1 has been cancelled.")
        );
    }

    @Test
    void customerCancel_nonOwner_throwsForbidden() {
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherCustomer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder("other@test.com", 1L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");

        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).findByIdWithLock(any());
    }

    @Test
    void customerCancel_shippedOrder_throwsBadRequest() {
        order.setStatus(OrderStatus.SHIPPED);

        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder("customer@test.com", 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order cannot be cancelled in status: SHIPPED");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void customerCancel_deliveredOrder_throwsBadRequest() {
        order.setStatus(OrderStatus.DELIVERED);

        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder("customer@test.com", 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order cannot be cancelled in status: DELIVERED");
    }

    @Test
    void customerCancel_alreadyCancelledOrder_throwsBadRequest() {
        order.setStatus(OrderStatus.CANCELLED);

        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder("customer@test.com", 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order is already cancelled");
    }

    // =========================================================
    // Admin Order Cancellation Tests
    // =========================================================

    @Test
    void adminCancel_shippedOrder_success() {
        order.setStatus(OrderStatus.SHIPPED);

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithLock(50L)).thenReturn(Optional.of(product2));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product1));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of());
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.cancelOrderAsAdmin("admin@test.com", 1L);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void adminCancel_deliveredOrder_throwsBadRequest() {
        order.setStatus(OrderStatus.DELIVERED);

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrderAsAdmin("admin@test.com", 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order cannot be cancelled in status: DELIVERED");
    }

    @Test
    void adminCancel_nonAdmin_throwsForbidden() {
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> orderService.cancelOrderAsAdmin("customer@test.com", 1L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("admin role required");
    }

    // =========================================================
    // Pessimistic Locking & Sorting Verification
    // =========================================================

    @Test
    void cancelOrder_acquiresProductLocksInAscendingIdOrder() {
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findByIdWithLock(50L)).thenReturn(Optional.of(product2));
        when(productRepository.findByIdWithLock(100L)).thenReturn(Optional.of(product1));
        when(paymentRepository.findByOrder(order)).thenReturn(List.of());
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        orderService.cancelOrder("customer@test.com", 1L);

        InOrder inOrder = inOrder(productRepository);
        // product2 has ID 50L, product1 has ID 100L -> 50L must be locked before 100L
        inOrder.verify(productRepository).findByIdWithLock(50L);
        inOrder.verify(productRepository).findByIdWithLock(100L);
    }
}
