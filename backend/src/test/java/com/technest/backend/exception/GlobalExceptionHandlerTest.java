package com.technest.backend.exception;

import com.technest.backend.config.CorrelationIdFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        MDC.clear();
    }

    @Test
    void handleResourceNotFoundException_IncludesRequestIdAndPath() {
        String testReqId = "req-test-uuid-999";
        MDC.put(CorrelationIdFilter.MDC_REQUEST_ID_KEY, testReqId);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/products/999");
        ResourceNotFoundException ex = new ResourceNotFoundException("Product not found");

        ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> response = handler.handleResourceNotFoundException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        
        ApiError apiError = (ApiError) response.getBody().error();
        assertThat(apiError.requestId()).isEqualTo(testReqId);
        assertThat(apiError.status()).isEqualTo(404);
        assertThat(apiError.error()).isEqualTo("Not Found");
        assertThat(apiError.message()).isEqualTo("Product not found");
        assertThat(apiError.path()).isEqualTo("/api/products/999");
    }

    @Test
    void handleBadRequestException_IncludesRequestIdAndPath() {
        String testReqId = "req-bad-request-111";
        MDC.put(CorrelationIdFilter.MDC_REQUEST_ID_KEY, testReqId);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/orders/checkout");
        BadRequestException ex = new BadRequestException("Insufficient stock");

        ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> response = handler.handleBadRequestException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        
        ApiError apiError = (ApiError) response.getBody().error();
        assertThat(apiError.requestId()).isEqualTo(testReqId);
        assertThat(apiError.status()).isEqualTo(400);
        assertThat(apiError.message()).isEqualTo("Insufficient stock");
    }
}
