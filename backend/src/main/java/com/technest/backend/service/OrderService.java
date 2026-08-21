package com.technest.backend.service;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.OrderItemDto;
import com.technest.backend.entity.Cart;
import com.technest.backend.entity.CartItem;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CartRepository;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            CartRepository cartRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    // =========================
    // CHECKOUT
    // =========================

    @Transactional
    public OrderDto checkout(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            // Check stock availability
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Not enough stock for product: "
                                + product.getName());
            }

            // Reduce product stock
            product.setStock(
                    product.getStock()
                            - cartItem.getQuantity());

            productRepository.save(product);

            // Create OrderItem
            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);

            orderItem.setProductName(
                    product.getName());

            orderItem.setPrice(
                    product.getPrice());

            orderItem.setQuantity(
                    cartItem.getQuantity());

            // Calculate subtotal
            BigDecimal subtotal = product.getPrice().multiply(
                    BigDecimal.valueOf(
                            cartItem.getQuantity()));

            orderItem.setSubtotal(subtotal);

            // Add item to order
            order.addItem(orderItem);

            // Add to total
            totalAmount = totalAmount.add(subtotal);
        }

        // Set total amount
        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful checkout
        cart.getItems().clear();

        cartRepository.save(cart);

        return mapToDto(savedOrder);
    }

    // =========================
    // GET ALL USER ORDERS
    // =========================

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.technest.backend.exception.UnauthorizedException("User not found"));

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);

        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // =========================
    // GET SINGLE ORDER
    // =========================

    public OrderDto getOrderById(
            String email,
            Long orderId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check order ownership
        if (!order.getUser().getId()
                .equals(user.getId())) {

            throw new ForbiddenException(
                    "Access denied");
        }

        return mapToDto(order);
    }

    // =========================
    // CANCEL ORDER
    // =========================

    @Transactional
    public OrderDto cancelOrder(
            String email,
            Long orderId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check order ownership
        if (!order.getUser().getId()
                .equals(user.getId())) {

            throw new ForbiddenException(
                    "Access denied");
        }

        // Prevent cancelling already cancelled order
        if (order.getStatus() == OrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Order is already cancelled");
        }

        // Restore product stock
        for (OrderItem orderItem : order.getItems()) {

            Product product = orderItem.getProduct();

            product.setStock(
                    product.getStock()
                            + orderItem.getQuantity());

            productRepository.save(product);
        }

        // Update order status
        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);

        return mapToDto(savedOrder);
    }

    // =========================
    // UPDATE ORDER STATUS
    // =========================

    @Transactional
    public OrderDto updateOrderStatus(
            String email,
            Long orderId,
            OrderStatus status) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check order ownership (unless we want to allow admins, but sticking to the basic rule for now)
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new ForbiddenException("Access denied");
        }

        if (status == null) {
            throw new BadRequestException("Status cannot be null");
        }

        // Cannot change already cancelled order
        if (order.getStatus() == OrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Cannot update a cancelled order");
        }

        // Cancellation must go through cancel endpoint
        if (status == OrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Use the cancel endpoint to cancel an order");
        }

        order.setStatus(status);

        Order savedOrder = orderRepository.save(order);

        return mapToDto(savedOrder);
    }

    // =========================
    // MAP ENTITY TO DTO
    // =========================

    private OrderDto mapToDto(Order order) {

        List<OrderItemDto> itemDtos = order.getItems()
                .stream()
                .map(item -> new OrderItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity(),
                        item.getSubtotal()))
                .collect(Collectors.toList());

        return new OrderDto(
                order.getId(),
                order.getUser().getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                itemDtos);
    }
}