package com.technest.backend.controller;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.UpdateOrderStatusRequest;
import com.technest.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping
    public ResponseEntity<OrderDto> checkout() {
        String email = getAuthenticatedUserEmail();
        OrderDto orderDto = orderService.checkout(email);
        return ResponseEntity.ok(orderDto);
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getUserOrders() {
        String email = getAuthenticatedUserEmail();
        List<OrderDto> orders = orderService.getUserOrders(email);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        OrderDto order = orderService.getOrderById(email, id);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {

        String email = getAuthenticatedUserEmail();
        OrderDto orderDto = orderService.updateOrderStatus(email, id, request.getStatus());

        return ResponseEntity.ok(orderDto);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long id) {

        String email = getAuthenticatedUserEmail();

        OrderDto orderDto = orderService.cancelOrder(email, id);

        return ResponseEntity.ok(orderDto);
    }
}