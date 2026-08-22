package com.technest.backend.repository;

import com.technest.backend.entity.Order;
import com.technest.backend.entity.User;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findAllByOrderByCreatedAtDesc();
    boolean existsByUserAndStatusAndItems_Product(User user, OrderStatus status, Product product);

    // Dashboard: count orders by status
    long countByStatus(OrderStatus status);

    // Dashboard: revenue from non-cancelled orders
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> :excludedStatus")
    BigDecimal sumTotalAmountExcludingStatus(@Param("excludedStatus") OrderStatus excludedStatus);

    // Dashboard: latest N orders (paged overload of the existing derived query)
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
