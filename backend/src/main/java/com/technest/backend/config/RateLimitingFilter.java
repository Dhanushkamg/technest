package com.technest.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.technest.backend.exception.ApiError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Lightweight in-memory rate limiting filter protecting sensitive endpoints
 * (/api/auth/login, /api/auth/register, /api/coupons/validate) against abuse.
 *
 * NOTE: This is an in-memory sliding window implementation.
 * Counters reset on application restart and are local to this node.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${rate-limit.auth.max-requests:30}")
    private int authMaxRequests;

    @Value("${rate-limit.auth.window-seconds:60}")
    private int authWindowSeconds;

    @Value("${rate-limit.coupon.max-requests:40}")
    private int couponMaxRequests;

    @Value("${rate-limit.coupon.window-seconds:60}")
    private int couponWindowSeconds;

    @Value("${rate-limit.trusted-proxy:false}")
    private boolean trustedProxy;

    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitingFilter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!rateLimitEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        int maxRequests = 0;
        int windowSeconds = 60;
        boolean isProtected = false;

        if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register")) {
            maxRequests = authMaxRequests;
            windowSeconds = authWindowSeconds;
            isProtected = true;
        } else if (uri.startsWith("/api/coupons/validate")) {
            maxRequests = couponMaxRequests;
            windowSeconds = couponWindowSeconds;
            isProtected = true;
        }

        if (isProtected) {
            final int windowSecs = windowSeconds;
            String clientIp = resolveClientIp(request);
            String bucketKey = clientIp + ":" + (uri.startsWith("/api/auth") ? "auth" : "coupon");

            RateLimitBucket bucket = buckets.compute(bucketKey, (k, existing) -> {
                long now = System.currentTimeMillis();
                if (existing == null || now - existing.windowStart > windowSecs * 1000L) {
                    return new RateLimitBucket(now, new AtomicInteger(1));
                }
                existing.counter.incrementAndGet();
                return existing;
            });

            if (bucket.counter.get() > maxRequests) {
                String requestId = (String) request.getAttribute(CorrelationIdFilter.REQUEST_ID_ATTRIBUTE);
                if (requestId == null) {
                    requestId = response.getHeader(CorrelationIdFilter.REQUEST_ID_HEADER);
                }

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(windowSeconds));

                ApiError error = new ApiError(
                        requestId,
                        LocalDateTime.now(),
                        HttpStatus.TOO_MANY_REQUESTS.value(),
                        HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                        "Too many requests. Please slow down and try again later.",
                        uri
                );

                response.getWriter().write(objectMapper.writeValueAsString(error));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (trustedProxy) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitBucket {
        final long windowStart;
        final AtomicInteger counter;

        RateLimitBucket(long windowStart, AtomicInteger counter) {
            this.windowStart = windowStart;
            this.counter = counter;
        }
    }
}
