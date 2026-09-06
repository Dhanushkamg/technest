package com.technest.backend.repository;

import com.technest.backend.entity.InventoryMovement;
import com.technest.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    Page<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<InventoryMovement> findByProductOrderByCreatedAtDesc(Product product, Pageable pageable);

    Page<InventoryMovement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
