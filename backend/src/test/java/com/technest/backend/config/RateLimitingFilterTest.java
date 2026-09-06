package com.technest.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingFilterTest {

    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitingFilter();
        ReflectionTestUtils.setField(filter, "rateLimitEnabled", true);
        ReflectionTestUtils.setField(filter, "authMaxRequests", 3);
        ReflectionTestUtils.setField(filter, "authWindowSeconds", 60);
        ReflectionTestUtils.setField(filter, "couponMaxRequests", 5);
        ReflectionTestUtils.setField(filter, "couponWindowSeconds", 60);
        ReflectionTestUtils.setField(filter, "trustedProxy", false);
    }

    @Test
    void doFilter_AllowsRequestsUnderLimit() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("192.168.1.100");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void doFilter_Returns429WhenLimitExceeded() throws Exception {
        String clientIp = "192.168.1.101";

        // Perform 3 requests (within limit)
        for (int i = 0; i < 3; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr(clientIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            filter.doFilter(req, resp, new MockFilterChain());
            assertThat(resp.getStatus()).isEqualTo(200);
        }

        // 4th request must be rejected with 429
        MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/auth/login");
        blockedReq.setRemoteAddr(clientIp);
        MockHttpServletResponse blockedResp = new MockHttpServletResponse();
        filter.doFilter(blockedReq, blockedResp, new MockFilterChain());

        assertThat(blockedResp.getStatus()).isEqualTo(429);
        assertThat(blockedResp.getContentAsString()).contains("Too many requests");
        assertThat(blockedResp.getHeader("Retry-After")).isEqualTo("60");
    }

    @Test
    void doFilter_DoesNotRateLimitPublicProductCatalog() throws Exception {
        String clientIp = "192.168.1.102";

        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/products");
            req.setRemoteAddr(clientIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            filter.doFilter(req, resp, new MockFilterChain());
            assertThat(resp.getStatus()).isEqualTo(200);
        }
    }
}
