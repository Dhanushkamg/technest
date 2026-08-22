package com.technest.backend.service;

import com.technest.backend.dto.CreatePaymentRequest;
import com.technest.backend.dto.PaymentConfirmRequest;
import com.technest.backend.dto.PaymentResponse;
import com.technest.backend.entity.NotificationType;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Payment;
import com.technest.backend.entity.PaymentStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.PaymentRepository;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private PaymentService paymentService;

    private User testUser;
    private User otherUser;
    private Order testOrder;
    private Payment pendingPayment;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("user@example.com");
        testUser.setRole("USER");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");
        otherUser.setRole("USER");

        testOrder = new Order();
        testOrder.setId(10L);
        testOrder.setUser(testUser);
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setTotalAmount(BigDecimal.valueOf(100.00));
        testOrder.setCreatedAt(LocalDateTime.now());

        pendingPayment = new Payment();
        pendingPayment.setId(100L);
        pendingPayment.setOrder(testOrder);
        pendingPayment.setAmount(BigDecimal.valueOf(100.00));
        pendingPayment.setPaymentMethod("CREDIT_CARD");
        pendingPayment.setStatus(PaymentStatus.PENDING);
        pendingPayment.setCreatedAt(LocalDateTime.now());
    }

    // -----------------------------------------------------------
    // initiatePayment tests
    // -----------------------------------------------------------

    @Test
    void initiatePayment_Success() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderId(testOrder.getId());
        request.setAmount(BigDecimal.valueOf(100.00));
        request.setPaymentMethod("CREDIT_CARD");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.existsByOrderAndStatus(testOrder, PaymentStatus.SUCCESS)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        PaymentResponse response = paymentService.initiatePayment(testUser.getEmail(), request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.PENDING); // Order status untouched on initiation
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void initiatePayment_AlreadyPaid_ThrowsBadRequest() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderId(testOrder.getId());
        request.setAmount(BigDecimal.valueOf(100.00));
        request.setPaymentMethod("CREDIT_CARD");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.existsByOrderAndStatus(testOrder, PaymentStatus.SUCCESS)).thenReturn(true);

        assertThatThrownBy(() -> paymentService.initiatePayment(testUser.getEmail(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order is already paid.");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    void initiatePayment_CancelledOrder_ThrowsBadRequest() {
        testOrder.setStatus(OrderStatus.CANCELLED);
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderId(testOrder.getId());
        request.setAmount(BigDecimal.valueOf(100.00));
        request.setPaymentMethod("CREDIT_CARD");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));

        assertThatThrownBy(() -> paymentService.initiatePayment(testUser.getEmail(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot process payment for a cancelled order.");
    }

    @Test
    void initiatePayment_AmountMismatch_ThrowsBadRequest() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderId(testOrder.getId());
        request.setAmount(BigDecimal.valueOf(50.00)); // Mismatch
        request.setPaymentMethod("CREDIT_CARD");

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.existsByOrderAndStatus(testOrder, PaymentStatus.SUCCESS)).thenReturn(false);

        assertThatThrownBy(() -> paymentService.initiatePayment(testUser.getEmail(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Payment amount must exactly match the order total amount.");
    }

    @Test
    void initiatePayment_OtherUser_ThrowsForbidden() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderId(testOrder.getId());
        request.setAmount(BigDecimal.valueOf(100.00));
        request.setPaymentMethod("CREDIT_CARD");

        when(userRepository.findByEmail(otherUser.getEmail())).thenReturn(Optional.of(otherUser));
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));

        assertThatThrownBy(() -> paymentService.initiatePayment(otherUser.getEmail(), request))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied: You do not own this order.");
    }

    // -----------------------------------------------------------
    // confirmPayment tests
    // -----------------------------------------------------------

    @Test
    void confirmPayment_Success_UpdatesOrderToConfirmed() {
        PaymentConfirmRequest confirmRequest = new PaymentConfirmRequest(PaymentStatus.SUCCESS);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(paymentRepository.findById(pendingPayment.getId())).thenReturn(Optional.of(pendingPayment));

        PaymentResponse response = paymentService.confirmPayment(testUser.getEmail(), pendingPayment.getId(), confirmRequest);

        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orderRepository).save(testOrder);
        verify(paymentRepository).save(pendingPayment);
        verify(notificationService).createNotification(eq(testUser), eq(NotificationType.PAYMENT_SUCCESS), any());
    }

    @Test
    void confirmPayment_Failed_KeepsOrderPending() {
        PaymentConfirmRequest confirmRequest = new PaymentConfirmRequest(PaymentStatus.FAILED);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(paymentRepository.findById(pendingPayment.getId())).thenReturn(Optional.of(pendingPayment));

        PaymentResponse response = paymentService.confirmPayment(testUser.getEmail(), pendingPayment.getId(), confirmRequest);

        assertThat(response.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(testOrder.getStatus()).isEqualTo(OrderStatus.PENDING); // Order remains pending
        verify(orderRepository, never()).save(testOrder);
        verify(paymentRepository).save(pendingPayment);
        verify(notificationService).createNotification(eq(testUser), eq(NotificationType.PAYMENT_FAILED), any());
    }

    @Test
    void confirmPayment_AlreadyFinalized_ThrowsBadRequest() {
        pendingPayment.setStatus(PaymentStatus.SUCCESS); // Already finalized
        PaymentConfirmRequest confirmRequest = new PaymentConfirmRequest(PaymentStatus.SUCCESS);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(paymentRepository.findById(pendingPayment.getId())).thenReturn(Optional.of(pendingPayment));

        assertThatThrownBy(() -> paymentService.confirmPayment(testUser.getEmail(), pendingPayment.getId(), confirmRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Payment is already finalized.");
    }

    @Test
    void confirmPayment_InvalidStatus_ThrowsBadRequest() {
        PaymentConfirmRequest confirmRequest = new PaymentConfirmRequest(PaymentStatus.PENDING); // Invalid for confirmation

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(paymentRepository.findById(pendingPayment.getId())).thenReturn(Optional.of(pendingPayment));

        assertThatThrownBy(() -> paymentService.confirmPayment(testUser.getEmail(), pendingPayment.getId(), confirmRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid payment confirmation status.");
    }

    @Test
    void confirmPayment_CancelledOrder_ThrowsBadRequest() {
        testOrder.setStatus(OrderStatus.CANCELLED);
        PaymentConfirmRequest confirmRequest = new PaymentConfirmRequest(PaymentStatus.SUCCESS);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(paymentRepository.findById(pendingPayment.getId())).thenReturn(Optional.of(pendingPayment));

        assertThatThrownBy(() -> paymentService.confirmPayment(testUser.getEmail(), pendingPayment.getId(), confirmRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot process payment for a cancelled order.");
    }
}
