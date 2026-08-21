package com.technest.backend.repository;

import com.technest.backend.entity.Order;
import com.technest.backend.entity.Payment;
import com.technest.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrder(Order order);
    boolean existsByOrderAndStatus(Order order, PaymentStatus status);
}
