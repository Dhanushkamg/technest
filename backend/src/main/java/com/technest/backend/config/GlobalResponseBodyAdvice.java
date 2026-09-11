package com.technest.backend.config;

import com.technest.backend.dto.ApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.http.ResponseEntity;

@RestControllerAdvice(basePackages = "com.technest.backend.controller")
public class GlobalResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        
        // Exclude Swagger/OpenAPI endpoints
        String path = request.getURI().getPath();
        if (path.contains("/v3/api-docs") || path.contains("/swagger-ui") || path.contains("/payhere/notify")) {
            return body;
        }

        // Prevent ClassCastException for String returns (StringHttpMessageConverter)
        if (body instanceof String) {
            return body; // Let it remain a string, optionally we could serialize ApiResponse to JSON string here
        }

        // If it's already an ApiResponse, don't wrap it again
        if (body instanceof ApiResponse) {
            return body;
        }

        // If the endpoint returned void or null
        if (body == null) {
            return ApiResponse.success(null);
        }

        // Return wrapped response
        return ApiResponse.success(body);
    }
}
