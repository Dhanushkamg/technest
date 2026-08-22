package com.technest.backend.repository;

import com.technest.backend.entity.OrderItem;
import com.technest.backend.entity.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Dashboard: top-selling products by aggregated quantity sold, excluding cancelled orders.
     * Uses productName snapshot field (not a join to Product) so it survives product deletion.
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
}
