package com.technest.backend.dto;

import java.time.LocalDateTime;

public record ApiResponse<T>(
        boolean success,
        T data,
        Object error,
        LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(Object error) {
        return new ApiResponse<>(false, null, error, LocalDateTime.now());
    }
}
