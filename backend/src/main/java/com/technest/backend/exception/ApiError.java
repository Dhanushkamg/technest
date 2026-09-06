package com.technest.backend.exception;

import java.time.LocalDateTime;

public record ApiError(
        String requestId,
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path) {

    public ApiError(LocalDateTime timestamp, int status, String error, String message, String path) {
        this(null, timestamp, status, error, message, path);
    }
}
