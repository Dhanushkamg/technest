package com.technest.backend.service;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.OrderItemDto;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AdminOrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    private User resolveAdminUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }
        return user;
    }

    // =========================
    // GET ALL ORDERS (admin)
    // =========================

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders(String email) {
        resolveAdminUser(email);
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // =========================
    // UPDATE ORDER STATUS (admin)
    // =========================

    @Transactional
    public OrderDto updateOrderStatus(String email, Long orderId, OrderStatus newStatus) {
        resolveAdminUser(email);

        if (newStatus == null) {
            throw new BadRequestException("Status cannot be null");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        validateTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }

    // =========================
    // TRANSITION VALIDATION
    // =========================

    private void validateTransition(OrderStatus current, OrderStatus next) {
        Set<OrderStatus> allowed = allowedTransitions(current);
        if (!allowed.contains(next)) {
            throw new BadRequestException(
                    "Invalid status transition: " + current + " → " + next
                            + ". Allowed: " + allowed);
        }
    }

    private Set<OrderStatus> allowedTransitions(OrderStatus current) {
        return switch (current) {
            case PENDING    -> Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED);
            case CONFIRMED  -> Set.of(OrderStatus.SHIPPED,   OrderStatus.CANCELLED);
            case SHIPPED    -> Set.of(OrderStatus.DELIVERED);
            case DELIVERED  -> Set.of();
            case CANCELLED  -> Set.of();
        };
    }

    // =========================
    // DTO MAPPING
    // =========================

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(this::mapItemToDto)
                .collect(Collectors.toList());

        return new OrderDto(
                order.getId(),
                order.getUser().getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                itemDtos);
    }

    private OrderItemDto mapItemToDto(OrderItem item) {
        return new OrderItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProductName(),
                item.getPrice(),
                item.getQuantity(),
                item.getSubtotal());
    }
}
