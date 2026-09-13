package com.technest.backend.exception;

import com.technest.backend.config.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private String resolveRequestId(HttpServletRequest request) {
        String reqId = MDC.get(CorrelationIdFilter.MDC_REQUEST_ID_KEY);
        if (reqId == null && request != null) {
            reqId = (String) request.getAttribute(CorrelationIdFilter.REQUEST_ID_ATTRIBUTE);
        }
        return reqId;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleResourceNotFoundException(
            ResourceNotFoundException exception,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                exception.getMessage(),
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleBadRequestException(
            BadRequestException exception,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                exception.getMessage(),
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleForbiddenException(
            ForbiddenException exception,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                exception.getMessage(),
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleUnauthorizedException(
            UnauthorizedException exception,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                exception.getMessage(),
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleHttpMessageNotReadableException(
            org.springframework.http.converter.HttpMessageNotReadableException exception,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Malformed JSON or invalid request format",
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleValidationException(
            org.springframework.web.bind.MethodArgumentNotValidException exception,
            HttpServletRequest request) {

        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleOptimisticLockingFailureException(
            org.springframework.orm.ObjectOptimisticLockingFailureException exception,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                "Another update was made. Please refresh and try again.",
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<com.technest.backend.dto.ApiResponse<ApiError>> handleGenericException(
            Exception exception,
            HttpServletRequest request) {

        // Log full stack trace so the real cause is never silently hidden
        log.error("Unhandled exception on {} {}: {}",
                request != null ? request.getMethod() : "UNKNOWN",
                request != null ? request.getRequestURI() : "UNKNOWN",
                exception.getMessage(), exception);

        ApiError error = new ApiError(
                resolveRequestId(request),
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "An unexpected error occurred",
                request != null ? request.getRequestURI() : null);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(com.technest.backend.dto.ApiResponse.error(error));
    }
}
