package com.technest.backend.repository;

import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Dashboard: top-selling products by aggregated quantity sold, excluding cancelled orders.
     * Returns Object[] rows: [productId (Long), productName (String), totalSold (Long)]
     */
    @Query("""
            SELECT oi.product.id, oi.productName, SUM(oi.quantity)
            FROM OrderItem oi
            WHERE oi.order.status <> :excludedStatus
            GROUP BY oi.product.id, oi.productName
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<Object[]> findTopSellingProducts(@Param("excludedStatus") OrderStatus excludedStatus, Pageable pageable);

    @Query("""
            SELECT oi.product.id, oi.productName, SUM(oi.quantity)
            FROM OrderItem oi
            WHERE oi.order.status <> :excludedStatus
              AND oi.order.createdAt >= :start
              AND oi.order.createdAt <= :end
            GROUP BY oi.product.id, oi.productName
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<Object[]> findTopSellingProductsInRange(@Param("excludedStatus") OrderStatus excludedStatus,
                                                 @Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end,
                                                 Pageable pageable);

    /**
     * Dashboard: top categories by sales revenue and quantity, excluding cancelled orders.
     * Returns Object[] rows: [categoryId (Long), categoryName (String), totalRevenue (BigDecimal), totalQuantity (Long)]
     */
    @Query("""
            SELECT oi.product.category.id, oi.product.category.name, SUM(oi.subtotal), SUM(oi.quantity)
            FROM OrderItem oi
            WHERE oi.order.status <> :excludedStatus
            GROUP BY oi.product.category.id, oi.product.category.name
            ORDER BY SUM(oi.subtotal) DESC
            """)
    List<Object[]> findTopCategories(@Param("excludedStatus") OrderStatus excludedStatus, Pageable pageable);

    @Query("""
            SELECT oi.product.category.id, oi.product.category.name, SUM(oi.subtotal), SUM(oi.quantity)
            FROM OrderItem oi
            WHERE oi.order.status <> :excludedStatus
              AND oi.order.createdAt >= :start
              AND oi.order.createdAt <= :end
            GROUP BY oi.product.category.id, oi.product.category.name
            ORDER BY SUM(oi.subtotal) DESC
            """)
    List<Object[]> findTopCategoriesInRange(@Param("excludedStatus") OrderStatus excludedStatus,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end,
                                            Pageable pageable);
}
