package com.technest.backend.controller;

import com.technest.backend.dto.CreatePaymentRequest;
import com.technest.backend.dto.PayHereCheckoutResponse;
import com.technest.backend.dto.PayHereCreateRequest;
import com.technest.backend.dto.PaymentConfirmRequest;
import com.technest.backend.dto.PaymentResponse;
import com.technest.backend.service.PayHereService;
import com.technest.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PayHereService payHereService;

    public PaymentController(PaymentService paymentService, PayHereService payHereService) {
        this.paymentService = paymentService;
        this.payHereService = payHereService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // -------------------------------------------------------------------------
    // Standard payment endpoints (authenticated)
    // -------------------------------------------------------------------------

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(@Valid @RequestBody CreatePaymentRequest request) {
        String email = getAuthenticatedUserEmail();
        PaymentResponse response = paymentService.initiatePayment(email, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentConfirmRequest request) {
        String email = getAuthenticatedUserEmail();
        PaymentResponse response = paymentService.confirmPayment(email, id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        String email = getAuthenticatedUserEmail();
        PaymentResponse response = paymentService.createPayment(email, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        String email = getAuthenticatedUserEmail();
        PaymentResponse response = paymentService.getPaymentById(email, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrderId(@PathVariable Long orderId) {
        String email = getAuthenticatedUserEmail();
        List<PaymentResponse> responses = paymentService.getPaymentsByOrderId(email, orderId);
        return ResponseEntity.ok(responses);
    }

    // -------------------------------------------------------------------------
    // PayHere endpoints
    // -------------------------------------------------------------------------

    /**
     * Authenticated endpoint — requires valid JWT.
     * Requests PayHere checkout configuration & pre-computed MD5 hash for an order.
     * The merchantSecret is NEVER included in the response.
     */
    @PostMapping("/payhere/create")
    public ResponseEntity<PayHereCheckoutResponse> createPayHereCheckout(
            @Valid @RequestBody PayHereCreateRequest request) {
        String email = getAuthenticatedUserEmail();
        PayHereCheckoutResponse response = payHereService.createCheckout(email, request.getOrderId());
        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint — PayHere servers call this directly (no JWT required).
     * Declared in SecurityConfig as permitAll for /api/payments/payhere/notify.
     *
     * PayHere sends application/x-www-form-urlencoded POST; @RequestParam captures all fields.
     * This is the SINGLE handler for the notify URL — no duplicate mapping.
     */
    @PostMapping(value = "/payhere/notify", consumes = {
            MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            MediaType.APPLICATION_JSON_VALUE,
            MediaType.ALL_VALUE
    })
    public ResponseEntity<String> handlePayHereNotify(@RequestParam Map<String, String> params) {
        boolean success = payHereService.processNotification(params);
        return ResponseEntity.ok(success ? "OK" : "RECEIVED");
    }
}
