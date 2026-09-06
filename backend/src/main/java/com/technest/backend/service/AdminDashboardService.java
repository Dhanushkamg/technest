package com.technest.backend.service;

import com.technest.backend.dto.DashboardResponse;
import com.technest.backend.dto.DeliveryAddressSnapshotDto;
import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.OrderItemDto;
import com.technest.backend.dto.RevenueTimelinePointDto;
import com.technest.backend.dto.TopCategoryDto;
import com.technest.backend.dto.TopSellingProductDto;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.BadRequestException;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    private void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new ForbiddenException("Access denied: admin role required");
        }
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {
        return getDashboard(email, "LAST_30_DAYS", null, null);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email, String range, String customStartDate, String customEndDate) {
        requireAdmin(email);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end = now;
        String filterName = range != null ? range.toUpperCase() : "LAST_30_DAYS";

        switch (filterName) {
            case "TODAY":
                start = now.toLocalDate().atStartOfDay();
                break;
            case "LAST_7_DAYS":
            case "7D":
                start = now.minusDays(7);
                filterName = "LAST_7_DAYS";
                break;
            case "LAST_3_MONTHS":
            case "3M":
            case "90D":
                start = now.minusDays(90);
                filterName = "LAST_3_MONTHS";
                break;
            case "LAST_1_YEAR":
            case "1Y":
            case "365D":
                start = now.minusDays(365);
                filterName = "LAST_1_YEAR";
                break;
            case "CUSTOM":
                if (customStartDate == null || customEndDate == null) {
                    throw new BadRequestException("Start date and end date are required for custom date range");
                }
                try {
                    LocalDate parsedStart = LocalDate.parse(customStartDate);
                    LocalDate parsedEnd = LocalDate.parse(customEndDate);
                    if (parsedStart.isAfter(parsedEnd)) {
                        throw new BadRequestException("Start date cannot be after end date");
                    }
                    start = parsedStart.atStartOfDay();
                    end = parsedEnd.atTime(LocalTime.MAX);
                } catch (Exception e) {
                    if (e instanceof BadRequestException) throw e;
                    throw new BadRequestException("Invalid date format. Expected YYYY-MM-DD");
                }
                break;
            case "LAST_30_DAYS":
            case "30D":
            default:
                start = now.minusDays(30);
                filterName = "LAST_30_DAYS";
                break;
        }

        // Summary counts
        long totalUsers      = userRepository.count();
        long totalProducts   = productRepository.count();
        long totalCategories = categoryRepository.count();
        long totalOrders     = orderRepository.countByCreatedAtBetween(start, end);

        // Revenue in range
        BigDecimal totalRevenue = orderRepository.sumTotalAmountExcludingStatusAndDateRange(
                OrderStatus.CANCELLED, start, end
        );

        // Order status counts
        long pendingOrders   = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long shippedOrders   = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        // Stock metrics
        long lowStockProducts = productRepository.countByStockLessThanEqual(LOW_STOCK_THRESHOLD);
        long outOfStockProducts = productRepository.countByStock(0);

        // Recent 5 orders
        Page<Order> recentPage = orderRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(0, RECENT_ORDERS_LIMIT));
        List<OrderDto> recentOrders = recentPage.getContent()
                .stream()
                .map(this::mapOrderToDto)
                .collect(Collectors.toList());

        // Top selling products in range
        List<Object[]> topRaw = orderItemRepository.findTopSellingProductsInRange(
                OrderStatus.CANCELLED, start, end, PageRequest.of(0, TOP_SELLING_LIMIT));
        List<TopSellingProductDto> topSellingProducts = topRaw.stream()
                .map(row -> new TopSellingProductDto(
                        (Long) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue()))
                .collect(Collectors.toList());

        // Top categories in range
        List<Object[]> topCatsRaw = orderItemRepository.findTopCategoriesInRange(
                OrderStatus.CANCELLED, start, end, PageRequest.of(0, 5));
        List<TopCategoryDto> topCategories = topCatsRaw.stream()
                .map(row -> new TopCategoryDto(
                        (Long) row[0],
                        (String) row[1],
                        (BigDecimal) row[2],
                        ((Number) row[3]).longValue()))
                .collect(Collectors.toList());

        // Revenue & order timeline
        List<Order> ordersInRange = orderRepository.findOrdersInRange(OrderStatus.CANCELLED, start, end);
        List<RevenueTimelinePointDto> revenueTimeline = buildTimeline(ordersInRange, start, end);

        DashboardResponse response = new DashboardResponse();
        response.setTotalUsers(totalUsers);
        response.setTotalProducts(totalProducts);
        response.setTotalCategories(totalCategories);
        response.setTotalOrders(totalOrders);
        response.setTotalRevenue(totalRevenue);
        response.setPendingOrders(pendingOrders);
        response.setConfirmedOrders(confirmedOrders);
        response.setShippedOrders(shippedOrders);
        response.setDeliveredOrders(deliveredOrders);
        response.setCancelledOrders(cancelledOrders);
        response.setLowStockProducts(lowStockProducts);
        response.setOutOfStockProducts(outOfStockProducts);
        response.setDateFilter(filterName);
        response.setRecentOrders(recentOrders);
        response.setTopSellingProducts(topSellingProducts);
        response.setTopCategories(topCategories);
        response.setRevenueTimeline(revenueTimeline);

        return response;
    }

    private List<RevenueTimelinePointDto> buildTimeline(List<Order> orders, LocalDateTime start, LocalDateTime end) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, RevenueTimelinePointDto> map = new LinkedHashMap<>();

        // Pre-populate daily buckets
        LocalDate cur = start.toLocalDate();
        LocalDate last = end.toLocalDate();
        while (!cur.isAfter(last)) {
            String key = cur.format(dtf);
            map.put(key, new RevenueTimelinePointDto(key, BigDecimal.ZERO, 0));
            cur = cur.plusDays(1);
        }

        for (Order o : orders) {
            String dateKey = o.getCreatedAt().format(dtf);
            RevenueTimelinePointDto point = map.get(dateKey);
            if (point == null) {
                point = new RevenueTimelinePointDto(dateKey, BigDecimal.ZERO, 0);
                map.put(dateKey, point);
            }
            point.setRevenue(point.getRevenue().add(o.getTotalAmount()));
            point.setOrderCount(point.getOrderCount() + 1);
        }

        return new ArrayList<>(map.values());
    }

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
