package com.technest.backend.service;

import com.technest.backend.dto.DashboardResponse;
import com.technest.backend.dto.DeliveryAddressSnapshotDto;
import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.OrderItemDto;
import com.technest.backend.dto.TopSellingProductDto;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CategoryRepository;
import com.technest.backend.repository.OrderItemRepository;
import com.technest.backend.repository.OrderRepository;
import com.technest.backend.repository.ProductRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final int RECENT_ORDERS_LIMIT = 5;
    private static final int TOP_SELLING_LIMIT    = 5;

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminDashboardService(UserRepository userRepository,
                                 ProductRepository productRepository,
                                 CategoryRepository categoryRepository,
                                 OrderRepository orderRepository,
                                 OrderItemRepository orderItemRepository) {
        this.userRepository     = userRepository;
        this.productRepository  = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository    = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    // -------------------------------------------------------
    // Admin guard — same pattern as AdminProductService
    // -------------------------------------------------------

    private void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }
    }

    // -------------------------------------------------------
    // Main dashboard assembler
    // -------------------------------------------------------

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {
        requireAdmin(email);

        // --- Summary counts ---
        long totalUsers      = userRepository.count();
        long totalProducts   = productRepository.count();
        long totalCategories = categoryRepository.count();
        long totalOrders     = orderRepository.count();

        // --- Revenue: sum of totalAmount excluding CANCELLED orders ---
        BigDecimal totalRevenue = orderRepository.sumTotalAmountExcludingStatus(OrderStatus.CANCELLED);

        // --- Order status buckets ---
        long pendingOrders   = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long shippedOrders   = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        // --- Low-stock products (stock <= threshold) ---
        long lowStockProducts = productRepository.countByStockLessThanEqual(LOW_STOCK_THRESHOLD);

        // --- Recent 5 orders (newest first) ---
        Page<Order> recentPage = orderRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(0, RECENT_ORDERS_LIMIT));
        List<OrderDto> recentOrders = recentPage.getContent()
                .stream()
                .map(this::mapOrderToDto)
                .collect(Collectors.toList());

        // --- Top 5 selling products (by quantity, excluding cancelled orders) ---
        List<Object[]> topRaw = orderItemRepository.findTopSellingProducts(
                OrderStatus.CANCELLED, PageRequest.of(0, TOP_SELLING_LIMIT));
        List<TopSellingProductDto> topSellingProducts = topRaw.stream()
                .map(row -> new TopSellingProductDto(
                        (Long) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue()))
                .collect(Collectors.toList());

        return new DashboardResponse(
                totalUsers, totalProducts, totalCategories, totalOrders, totalRevenue,
                pendingOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders,
                lowStockProducts, recentOrders, topSellingProducts);
    }

    // -------------------------------------------------------
    // DTO mapping — mirrors AdminOrderService.mapToDto
    // -------------------------------------------------------

    private OrderDto mapOrderToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(this::mapItemToDto)
                .collect(Collectors.toList());

        DeliveryAddressSnapshotDto snapshotDto = null;
        if (order.getDeliveryAddress() != null) {
            snapshotDto = new DeliveryAddressSnapshotDto(
                    order.getDeliveryAddress().getFullName(),
                    order.getDeliveryAddress().getPhoneNumber(),
                    order.getDeliveryAddress().getAddressLine1(),
                    order.getDeliveryAddress().getAddressLine2(),
                    order.getDeliveryAddress().getCity(),
                    order.getDeliveryAddress().getPostalCode(),
                    order.getDeliveryAddress().getCountry());
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
