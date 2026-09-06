package com.technest.backend.repository;

import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Product;
import com.technest.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findAllByOrderByCreatedAtDesc();

    boolean existsByUserAndStatusAndItems_Product(User user, OrderStatus status, Product product);

    // Coupon validations
    long countByUser(User user);

    long countByUserAndStatusNot(User user, OrderStatus status);

    long countByUserAndCouponCodeIgnoreCase(User user, String couponCode);

    // Dashboard counts
    long countByStatus(OrderStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime start, LocalDateTime end);

    // Revenue aggregations
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> :excludedStatus")
    BigDecimal sumTotalAmountExcludingStatus(@Param("excludedStatus") OrderStatus excludedStatus);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> :excludedStatus AND o.createdAt >= :start AND o.createdAt <= :end")
    BigDecimal sumTotalAmountExcludingStatusAndDateRange(@Param("excludedStatus") OrderStatus excludedStatus,
                                                        @Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.status <> :excludedStatus AND o.createdAt >= :start AND o.createdAt <= :end ORDER BY o.createdAt ASC")
    List<Order> findOrdersInRange(@Param("excludedStatus") OrderStatus excludedStatus,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            SELECT o FROM Order o
            WHERE (:status IS NULL OR o.status = :status)
              AND (:search IS NULL OR CAST(o.id AS string) LIKE :search OR LOWER(o.user.email) LIKE :search OR (o.deliveryAddress IS NOT NULL AND LOWER(o.deliveryAddress.fullName) LIKE :search))
            ORDER BY o.createdAt DESC
            """)
    Page<Order> searchOrders(@Param("status") OrderStatus status,
                             @Param("search") String search,
                             Pageable pageable);
}
