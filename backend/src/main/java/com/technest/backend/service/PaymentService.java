package com.technest.backend.service;

import com.technest.backend.dto.CreatePaymentRequest;
import com.technest.backend.dto.PaymentResponse;
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
import com.technest.backend.entity.NotificationType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository, UserRepository userRepository, NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public PaymentResponse createPayment(String email, CreatePaymentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check ownership
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new ForbiddenException("Access denied: You do not own this order.");
        }

        // Check if order is already cancelled
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot pay for a cancelled order.");
        }

        // Prevent duplicate successful payments
        if (paymentRepository.existsByOrderAndStatus(order, PaymentStatus.SUCCESS)) {
            throw new BadRequestException("Order is already paid.");
        }

        // Validate amount exactly matches order total
        if (request.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new BadRequestException("Payment amount must exactly match the order total amount.");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setCreatedAt(LocalDateTime.now());

        // Simulate Payment Processing
        if ("FAIL".equalsIgnoreCase(request.getPaymentMethod())) {
            payment.setStatus(PaymentStatus.FAILED);
        } else {
            payment.setStatus(PaymentStatus.SUCCESS);
            // Update order status upon success
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        Payment savedPayment = paymentRepository.save(payment);

        // Notify user based on payment outcome
        if (savedPayment.getStatus() == PaymentStatus.SUCCESS) {
            notificationService.createNotification(
                    user,
                    NotificationType.PAYMENT_SUCCESS,
                    "Payment of " + savedPayment.getAmount() + " for order #" + order.getId() + " was successful."
            );
        } else {
            notificationService.createNotification(
                    user,
                    NotificationType.PAYMENT_FAILED,
                    "Payment of " + savedPayment.getAmount() + " for order #" + order.getId() + " failed. Please try again."
            );
        }

        return mapToDto(savedPayment);
    }

    public PaymentResponse getPaymentById(String email, Long paymentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        // Check ownership
        if (!payment.getOrder().getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new ForbiddenException("Access denied.");
        }

        return mapToDto(payment);
    }

    public List<PaymentResponse> getPaymentsByOrderId(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check ownership
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new ForbiddenException("Access denied.");
        }

        return paymentRepository.findByOrder(order).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToDto(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
    }
}
