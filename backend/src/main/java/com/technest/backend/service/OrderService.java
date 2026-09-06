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
import com.technest.backend.repository.AddressRepository;
import com.technest.backend.repository.CartRepository;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import com.technest.backend.entity.NotificationType;
import com.technest.backend.entity.Payment;
import com.technest.backend.entity.PaymentStatus;
import com.technest.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final NotificationService notificationService;
    private final com.technest.backend.repository.CouponRepository couponRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryService inventoryService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            AddressRepository addressRepository,
            NotificationService notificationService,
            com.technest.backend.repository.CouponRepository couponRepository,
            PaymentRepository paymentRepository,
            InventoryService inventoryService) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.notificationService = notificationService;
        this.couponRepository = couponRepository;
        this.paymentRepository = paymentRepository;
        this.inventoryService = inventoryService;
    }

    // =========================
    // CHECKOUT
    // =========================

    @Transactional
    public OrderDto checkout(String email, Long addressId, String couponCode) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        com.technest.backend.entity.Address deliveryAddress = null;
        if (addressId != null) {
            deliveryAddress = addressRepository.findById(addressId)
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
            if (!deliveryAddress.getUser().getId().equals(user.getId())) {
                throw new ForbiddenException("You do not have permission to use this address");
            }
        } else {
            deliveryAddress = addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                    .stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No delivery address found. Please add a delivery address before checkout."));
        }

        // Lock products in ascending ID order to prevent deadlocks under concurrent checkouts
        java.util.List<CartItem> sortedItems = cart.getItems().stream()
                .sorted(java.util.Comparator.comparing(ci -> ci.getProduct().getId()))
                .collect(java.util.stream.Collectors.toList());

        // Load locked product snapshots (pessimistic write lock)
        java.util.Map<Long, Product> lockedProducts = new java.util.LinkedHashMap<>();
        for (CartItem cartItem : sortedItems) {
            Long productId = cartItem.getProduct().getId();
            Product lockedProduct = productRepository.findByIdWithLock(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getName()));
            lockedProducts.put(productId, lockedProduct);
        }

        // --- Phase 1: Validate ALL stock before reducing ANY ---
        for (CartItem cartItem : sortedItems) {
            Product product = lockedProducts.get(cartItem.getProduct().getId());
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for '" + product.getName() + "'. "
                        + "Available: " + product.getStock() + ", Requested: " + cartItem.getQuantity());
            }
        }

        // --- Phase 2: All validations passed — reduce stock and build order ---
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setDeliveryAddress(new com.technest.backend.entity.DeliveryAddressSnapshot(
                deliveryAddress.getFullName(),
                deliveryAddress.getPhoneNumber(),
                deliveryAddress.getAddressLine1(),
                deliveryAddress.getAddressLine2(),
                deliveryAddress.getCity(),
                deliveryAddress.getPostalCode(),
                deliveryAddress.getCountry()
        ));

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : sortedItems) {
            Product product = lockedProducts.get(cartItem.getProduct().getId());

            // Reduce product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            // Create OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());

            // Calculate item subtotal
            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderItem.setSubtotal(itemSubtotal);

            order.addItem(orderItem);
            subtotal = subtotal.add(itemSubtotal);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        com.technest.backend.entity.Coupon appliedCoupon = null;

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            String normalizedCode = couponCode.trim().toUpperCase();
            appliedCoupon = couponRepository.findByCodeWithLock(normalizedCode)
                    .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

            if (!appliedCoupon.isActive()) {
                throw new BadRequestException("Coupon is not active");
            }
            if (appliedCoupon.getExpirationDate() != null && LocalDateTime.now().isAfter(appliedCoupon.getExpirationDate())) {
                throw new BadRequestException("Coupon is expired");
            }
            if (appliedCoupon.getMaxUsageLimit() != null && appliedCoupon.getUsageCount() >= appliedCoupon.getMaxUsageLimit()) {
                throw new BadRequestException("Coupon usage limit reached");
            }
            if (appliedCoupon.getMinOrderAmount() != null && subtotal.compareTo(appliedCoupon.getMinOrderAmount()) < 0) {
                throw new BadRequestException("Minimum order amount for this coupon not met");
            }
            if (appliedCoupon.isFirstOrderOnly() && orderRepository.countByUserAndStatusNot(user, OrderStatus.CANCELLED) > 0) {
                throw new BadRequestException("Coupon is only valid for your first order");
            }
            if (appliedCoupon.getPerUserLimit() != null && orderRepository.countByUserAndCouponCodeIgnoreCase(user, normalizedCode) >= appliedCoupon.getPerUserLimit()) {
                throw new BadRequestException("Coupon usage limit per user reached");
            }

            if (appliedCoupon.getDiscountType() == com.technest.backend.entity.DiscountType.PERCENTAGE) {
                discountAmount = subtotal.multiply(appliedCoupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            } else if (appliedCoupon.getDiscountType() == com.technest.backend.entity.DiscountType.FIXED_AMOUNT) {
                discountAmount = appliedCoupon.getDiscountValue();
            }

            if (appliedCoupon.getMaxDiscountAmount() != null && discountAmount.compareTo(appliedCoupon.getMaxDiscountAmount()) > 0) {
                discountAmount = appliedCoupon.getMaxDiscountAmount();
            }

            if (discountAmount.compareTo(subtotal) > 0) {
                discountAmount = subtotal;
            }

            appliedCoupon.setUsageCount(appliedCoupon.getUsageCount() + 1);
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setCouponCode(appliedCoupon != null ? appliedCoupon.getCode() : null);
        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Record inventory SALE movements
        for (CartItem cartItem : sortedItems) {
            Product product = lockedProducts.get(cartItem.getProduct().getId());
            inventoryService.recordMovement(
                    product, product.getStock() + cartItem.getQuantity(), -cartItem.getQuantity(), product.getStock(),
                    com.technest.backend.entity.MovementType.SALE,
                    "Order #" + savedOrder.getId(), user.getEmail()
            );
        }

        // Clear cart after successful checkout
        cart.getItems().clear();
        cartRepository.save(cart);

        // Notify user
        notificationService.createNotification(
                user,
                NotificationType.ORDER_CREATED,
                "Your order #" + savedOrder.getId() + " has been placed successfully."
        );

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
    // CANCEL ORDER (Customer)
    // =========================

    @Transactional
    public OrderDto cancelOrder(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check order ownership
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        // Customers can only cancel PENDING or CONFIRMED orders
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        }

        return processOrderCancellation(order);
    }

    // =========================
    // CANCEL ORDER (Admin)
    // =========================

    @Transactional
    public OrderDto cancelOrderAsAdmin(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        // Admins can cancel PENDING, CONFIRMED, or SHIPPED orders
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        }

        return processOrderCancellation(order);
    }

    // =========================
    // SHARED CANCELLATION LOGIC
    // =========================

    private OrderDto processOrderCancellation(Order order) {
        // Collect and sort product IDs to acquire locks in ascending order (prevent deadlocks)
        List<Long> productIds = order.getItems().stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        Map<Long, Product> lockedProducts = new LinkedHashMap<>();
        for (Long productId : productIds) {
            Product lockedProduct = productRepository.findByIdWithLock(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            lockedProducts.put(productId, lockedProduct);
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product lockedProduct = lockedProducts.get(item.getProduct().getId());
            int oldStock = lockedProduct.getStock();
            int newStock = oldStock + item.getQuantity();
            lockedProduct.setStock(newStock);
            productRepository.save(lockedProduct);

            inventoryService.recordMovement(
                    lockedProduct, oldStock, item.getQuantity(), newStock,
                    com.technest.backend.entity.MovementType.RETURN,
                    "Order #" + order.getId() + " cancellation", order.getUser().getEmail()
            );
        }

        // Refund payment if present and SUCCESS
        List<Payment> payments = paymentRepository.findByOrder(order);
        for (Payment payment : payments) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
                notificationService.createNotification(
                        order.getUser(),
                        com.technest.backend.entity.NotificationType.REFUND_PROCESSED,
                        "Refund of " + payment.getAmount() + " for order #" + order.getId() + " has been processed."
                );
            }
        }

        // Update order status to CANCELLED
        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Notify user about order cancellation
        notificationService.createNotification(
                order.getUser(),
                com.technest.backend.entity.NotificationType.ORDER_CANCELLED,
                "Your order #" + savedOrder.getId() + " has been cancelled."
        );

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

        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: only administrators can change order status");
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

        com.technest.backend.dto.DeliveryAddressSnapshotDto snapshotDto = null;
        if (order.getDeliveryAddress() != null) {
            snapshotDto = new com.technest.backend.dto.DeliveryAddressSnapshotDto(
                    order.getDeliveryAddress().getFullName(),
                    order.getDeliveryAddress().getPhoneNumber(),
                    order.getDeliveryAddress().getAddressLine1(),
                    order.getDeliveryAddress().getAddressLine2(),
                    order.getDeliveryAddress().getCity(),
                    order.getDeliveryAddress().getPostalCode(),
                    order.getDeliveryAddress().getCountry()
            );
        }

        return new OrderDto(
                order.getId(),
                order.getUser().getId(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getCouponCode(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                snapshotDto,
                itemDtos);
    }
}