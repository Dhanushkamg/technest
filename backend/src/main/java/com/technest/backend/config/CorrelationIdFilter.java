package com.technest.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Filter that attaches a unique correlation ID (X-Request-ID) to every incoming HTTP request,
 * populates the SLF4J MDC for structured logging, and returns the correlation ID in the response headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String MDC_REQUEST_ID_KEY = "requestId";
    public static final String REQUEST_ID_ATTRIBUTE = "requestId";

    private static final Pattern SAFE_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestId = request.getHeader(REQUEST_ID_HEADER);

        if (requestId == null || !SAFE_ID_PATTERN.matcher(requestId).matches()) {
            requestId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_REQUEST_ID_KEY, requestId);
        request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_REQUEST_ID_KEY);
        }
    }
}
