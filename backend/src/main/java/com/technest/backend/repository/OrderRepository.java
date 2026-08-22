package com.technest.backend.repository;

import com.technest.backend.entity.Order;
import com.technest.backend.entity.User;
import com.technest.backend.entity.OrderStatus;
import com.technest.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findAllByOrderByCreatedAtDesc();
    boolean existsByUserAndStatusAndItems_Product(User user, OrderStatus status, Product product);
}
