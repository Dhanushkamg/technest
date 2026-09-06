package com.technest.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class CorrelationIdFilterTest {

    private CorrelationIdFilter filter;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
    }

    @Test
    void doFilter_GeneratesNewRequestId_WhenNoneProvided() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/products");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        String responseHeader = response.getHeader(CorrelationIdFilter.REQUEST_ID_HEADER);
        assertThat(responseHeader).isNotNull().isNotBlank();
        assertThat(request.getAttribute(CorrelationIdFilter.REQUEST_ID_ATTRIBUTE)).isEqualTo(responseHeader);
        // MDC must be cleared after filter finishes
        assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_ID_KEY)).isNull();
    }

    @Test
    void doFilter_PreservesValidIncomingRequestId() throws Exception {
        String customId = "req-12345-abcde";
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/products");
        request.addHeader(CorrelationIdFilter.REQUEST_ID_HEADER, customId);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        assertThat(response.getHeader(CorrelationIdFilter.REQUEST_ID_HEADER)).isEqualTo(customId);
        assertThat(request.getAttribute(CorrelationIdFilter.REQUEST_ID_ATTRIBUTE)).isEqualTo(customId);
        assertThat(MDC.get(CorrelationIdFilter.MDC_REQUEST_ID_KEY)).isNull();
    }

    @Test
    void doFilter_ReplacesInvalidOrOversizedRequestId() throws Exception {
        // String with invalid characters or too long
        String maliciousId = "invalid_id_with_special_chars_!@#$%^&*()_+<>?:\"{}|";
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/products");
        request.addHeader(CorrelationIdFilter.REQUEST_ID_HEADER, maliciousId);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        String assignedId = response.getHeader(CorrelationIdFilter.REQUEST_ID_HEADER);
        assertThat(assignedId).isNotNull().isNotEqualTo(maliciousId);
    }
}
