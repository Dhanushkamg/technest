package com.technest.backend.service;

import com.technest.backend.dto.DashboardResponse;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.CategoryRepository;
import com.technest.backend.repository.OrderItemRepository;
import com.technest.backend.repository.OrderRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;

    @InjectMocks
    private AdminDashboardService dashboardService;

    private User adminUser;
    private User regularUser;
    private Order sampleOrder;

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

        sampleOrder = new Order();
        sampleOrder.setId(10L);
        sampleOrder.setUser(adminUser);
        sampleOrder.setStatus(OrderStatus.DELIVERED);
        sampleOrder.setTotalAmount(BigDecimal.valueOf(150.00));
        sampleOrder.setSubtotal(BigDecimal.valueOf(150.00));
        sampleOrder.setDiscountAmount(BigDecimal.ZERO);
        sampleOrder.setCreatedAt(LocalDateTime.now());
        sampleOrder.setItems(new ArrayList<>());
    }

    // -----------------------------------------------------------
    // 1. Admin successfully retrieves dashboard (non-null, complete)
    // -----------------------------------------------------------

    @Test
    void getDashboard_adminUser_success_returnsNonNullResponse() {
        stubAllRepositories();

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response).isNotNull();
        assertThat(response.getRecentOrders()).isNotNull();
        assertThat(response.getTopSellingProducts()).isNotNull();
    }

    // -----------------------------------------------------------
    // 2. Correct basic counts
    // -----------------------------------------------------------

    @Test
    void getDashboard_correctBasicCounts() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(120L);
        when(productRepository.count()).thenReturn(84L);
        when(categoryRepository.count()).thenReturn(12L);
        when(orderRepository.count()).thenReturn(340L);
        when(orderRepository.sumTotalAmountExcludingStatus(OrderStatus.CANCELLED))
                .thenReturn(BigDecimal.valueOf(48320.50));
        stubStatusCounts(14, 22, 18, 281, 5);
        when(productRepository.countByStockLessThanEqual(5)).thenReturn(7L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response.getTotalUsers()).isEqualTo(120L);
        assertThat(response.getTotalProducts()).isEqualTo(84L);
        assertThat(response.getTotalCategories()).isEqualTo(12L);
        assertThat(response.getTotalOrders()).isEqualTo(340L);
    }

    // -----------------------------------------------------------
    // 3. Correct total revenue
    // -----------------------------------------------------------

    @Test
    void getDashboard_correctRevenue() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(1L);
        when(categoryRepository.count()).thenReturn(1L);
        when(orderRepository.count()).thenReturn(2L);
        when(orderRepository.sumTotalAmountExcludingStatus(OrderStatus.CANCELLED))
                .thenReturn(BigDecimal.valueOf(999.99));
        stubStatusCounts(0, 0, 0, 2, 0);
        when(productRepository.countByStockLessThanEqual(5)).thenReturn(0L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response.getTotalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(999.99));
        // Verify it calls with CANCELLED as the excluded status
        verify(orderRepository).sumTotalAmountExcludingStatus(OrderStatus.CANCELLED);
    }

    // -----------------------------------------------------------
    // 4. Correct counts for all order statuses
    // -----------------------------------------------------------

    @Test
    void getDashboard_correctStatusCounts() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(1L);
        when(categoryRepository.count()).thenReturn(1L);
        when(orderRepository.count()).thenReturn(60L);
        when(orderRepository.sumTotalAmountExcludingStatus(any())).thenReturn(BigDecimal.ZERO);
        stubStatusCounts(10, 15, 20, 12, 3);
        when(productRepository.countByStockLessThanEqual(anyInt())).thenReturn(0L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response.getPendingOrders()).isEqualTo(10L);
        assertThat(response.getConfirmedOrders()).isEqualTo(15L);
        assertThat(response.getShippedOrders()).isEqualTo(20L);
        assertThat(response.getDeliveredOrders()).isEqualTo(12L);
        assertThat(response.getCancelledOrders()).isEqualTo(3L);
    }

    // -----------------------------------------------------------
    // 5. Recent orders limited to 5
    // -----------------------------------------------------------

    @Test
    void getDashboard_recentOrdersLimitedToFive() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(1L);
        when(categoryRepository.count()).thenReturn(1L);
        when(orderRepository.count()).thenReturn(1L);
        when(orderRepository.sumTotalAmountExcludingStatus(any())).thenReturn(BigDecimal.ZERO);
        stubStatusCounts(0, 0, 0, 1, 0);
        when(productRepository.countByStockLessThanEqual(anyInt())).thenReturn(0L);

        // Return only 1 order to keep the test simple
        Page<Order> page = new PageImpl<>(List.of(sampleOrder));
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(page);
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());

        dashboardService.getDashboard(adminUser.getEmail());

        // Verify that PageRequest was called with page=0, size=5
        verify(orderRepository).findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5));
    }

    // -----------------------------------------------------------
    // 6. Low-stock count
    // -----------------------------------------------------------

    @Test
    void getDashboard_lowStockCount() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(10L);
        when(categoryRepository.count()).thenReturn(1L);
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.sumTotalAmountExcludingStatus(any())).thenReturn(BigDecimal.ZERO);
        stubStatusCounts(0, 0, 0, 0, 0);
        when(productRepository.countByStockLessThanEqual(5)).thenReturn(3L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response.getLowStockProducts()).isEqualTo(3L);
        verify(productRepository).countByStockLessThanEqual(5);
    }

    // -----------------------------------------------------------
    // 7. Top-selling product aggregation mapping
    // -----------------------------------------------------------

    @Test
    void getDashboard_topSellingProductsMappedCorrectly() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(1L);
        when(categoryRepository.count()).thenReturn(1L);
        when(orderRepository.count()).thenReturn(1L);
        when(orderRepository.sumTotalAmountExcludingStatus(any())).thenReturn(BigDecimal.ZERO);
        stubStatusCounts(0, 0, 0, 1, 0);
        when(productRepository.countByStockLessThanEqual(anyInt())).thenReturn(0L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());

        Object[] row1 = { 5L, "Wireless Mouse", 120L };
        Object[] row2 = { 7L, "USB Hub", 85L };
        when(orderItemRepository.findTopSellingProducts(eq(OrderStatus.CANCELLED), any()))
                .thenReturn(List.of(row1, row2));

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response.getTopSellingProducts()).hasSize(2);
        assertThat(response.getTopSellingProducts().get(0).getProductId()).isEqualTo(5L);
        assertThat(response.getTopSellingProducts().get(0).getProductName()).isEqualTo("Wireless Mouse");
        assertThat(response.getTopSellingProducts().get(0).getTotalSold()).isEqualTo(120L);
        assertThat(response.getTopSellingProducts().get(1).getProductId()).isEqualTo(7L);

        // Verify that CANCELLED orders are excluded from top-selling
        verify(orderItemRepository).findTopSellingProducts(eq(OrderStatus.CANCELLED), any());
        // Verify top-5 limit applied
        verify(orderItemRepository).findTopSellingProducts(any(), eq(PageRequest.of(0, 5)));
    }

    // -----------------------------------------------------------
    // 8. Non-admin user throws ForbiddenException
    // -----------------------------------------------------------

    @Test
    void getDashboard_nonAdminUser_throwsForbidden() {
        when(userRepository.findByEmail(regularUser.getEmail())).thenReturn(Optional.of(regularUser));

        assertThatThrownBy(() -> dashboardService.getDashboard(regularUser.getEmail()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("admin role required");

        // No repository reads should occur
        verify(orderRepository, never()).count();
        verify(productRepository, never()).count();
    }

    // -----------------------------------------------------------
    // 9. Missing user throws ResourceNotFoundException
    // -----------------------------------------------------------

    @Test
    void getDashboard_unknownEmail_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> dashboardService.getDashboard("ghost@test.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    // -----------------------------------------------------------
    // 10. Empty/no-order data returns safe zero/empty values
    // -----------------------------------------------------------

    @Test
    void getDashboard_noOrders_returnsZeroRevenueAndEmptyLists() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(0L);
        when(productRepository.count()).thenReturn(0L);
        when(categoryRepository.count()).thenReturn(0L);
        when(orderRepository.count()).thenReturn(0L);
        // COALESCE(SUM(...), 0) → returns BigDecimal.ZERO when no rows match
        when(orderRepository.sumTotalAmountExcludingStatus(OrderStatus.CANCELLED))
                .thenReturn(BigDecimal.ZERO);
        stubStatusCounts(0, 0, 0, 0, 0);
        when(productRepository.countByStockLessThanEqual(anyInt())).thenReturn(0L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());

        DashboardResponse response = dashboardService.getDashboard(adminUser.getEmail());

        assertThat(response.getTotalOrders()).isZero();
        assertThat(response.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getRecentOrders()).isEmpty();
        assertThat(response.getTopSellingProducts()).isEmpty();
        assertThat(response.getPendingOrders()).isZero();
        assertThat(response.getCancelledOrders()).isZero();
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------

    private void stubAllRepositories() {
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(userRepository.count()).thenReturn(1L);
        when(productRepository.count()).thenReturn(1L);
        when(categoryRepository.count()).thenReturn(1L);
        when(orderRepository.count()).thenReturn(1L);
        when(orderRepository.sumTotalAmountExcludingStatus(any())).thenReturn(BigDecimal.valueOf(100));
        stubStatusCounts(0, 0, 0, 1, 0);
        when(productRepository.countByStockLessThanEqual(anyInt())).thenReturn(0L);
        when(orderRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(Page.empty());
        when(orderItemRepository.findTopSellingProducts(any(), any())).thenReturn(List.of());
    }

    private void stubStatusCounts(long pending, long confirmed, long shipped, long delivered, long cancelled) {
        when(orderRepository.countByStatus(OrderStatus.PENDING)).thenReturn(pending);
        when(orderRepository.countByStatus(OrderStatus.CONFIRMED)).thenReturn(confirmed);
        when(orderRepository.countByStatus(OrderStatus.SHIPPED)).thenReturn(shipped);
        when(orderRepository.countByStatus(OrderStatus.DELIVERED)).thenReturn(delivered);
        when(orderRepository.countByStatus(OrderStatus.CANCELLED)).thenReturn(cancelled);
    }
}
