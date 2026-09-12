package com.technest.backend.controller;

import com.technest.backend.dto.OrderDto;
import com.technest.backend.dto.UpdateOrderStatusRequest;
import com.technest.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    private String getAuthenticatedUserEmail() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<OrderDto> checkout(@RequestBody(required = false) com.technest.backend.dto.CreateOrderRequest request) {
        String email = getAuthenticatedUserEmail();
        Long addressId = (request != null) ? request.getAddressId() : null;
        String couponCode = (request != null) ? request.getCouponCode() : null;
        OrderDto orderDto = orderService.checkout(email, addressId, couponCode);
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
        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        OrderDto order = orderService.getOrderById(email, id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/guest-checkout")
    public ResponseEntity<OrderDto> guestCheckout(@RequestBody com.technest.backend.dto.GuestCheckoutRequest request) {
        OrderDto orderDto = orderService.guestCheckout(request);
        return ResponseEntity.ok(orderDto);
    }

    @GetMapping("/guest/{id}")
    public ResponseEntity<OrderDto> getGuestOrderById(@PathVariable Long id, @RequestParam String token) {
        OrderDto order = orderService.getGuestOrderByToken(id, token);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        byte[] pdfBytes = orderService.generateInvoice(email, id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {

        String email = getAuthenticatedUserEmail();
        OrderDto orderDto = orderService.updateOrderStatus(email, id, request.getStatus());

        return ResponseEntity.ok(orderDto);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrderPost(@PathVariable Long id) {
        return cancelOrder(id);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long id) {

        String email = getAuthenticatedUserEmail();

        OrderDto orderDto = orderService.cancelOrder(email, id);

        return ResponseEntity.ok(orderDto);
    }
}
