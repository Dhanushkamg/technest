package com.technest.backend.controller;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.UpdateOrderStatusRequest;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.service.AdminOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    /**
     * GET /api/admin/orders
     * Returns all orders sorted by createdAt descending.
     * Only accessible by users with ADMIN role.
     */
    @GetMapping
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        String email = getAuthenticatedUserEmail();
        List<OrderDto> orders = adminOrderService.getAllOrders(email);
        return ResponseEntity.ok(orders);
    }

    /**
     * PUT /api/admin/orders/{id}/status
     * Updates the status of an order, enforcing valid transitions.
     * Only accessible by users with ADMIN role.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {

        if (request.getStatus() == null) {
            throw new BadRequestException("Status field is required and must be a valid value: "
                    + "PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED");
        }

        String email = getAuthenticatedUserEmail();
        OrderDto updatedOrder = adminOrderService.updateOrderStatus(email, id, request.getStatus());
        return ResponseEntity.ok(updatedOrder);
    }
}
