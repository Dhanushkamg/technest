package com.technest.backend.security;

import com.technest.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class SecurityAuthorizationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    private String getCustomerToken() {
        return "Bearer " + jwtService.generateToken("customer@example.com", "USER");
    }

    private String getAdminToken() {
        return "Bearer " + jwtService.generateToken("admin@example.com", "ADMIN");
    }

    // =========================================================================
    // 1. Unauthenticated Access (Expect 401 Unauthorized)
    // =========================================================================

    @Test
    @DisplayName("Unauthenticated request to /api/admin/orders should return 401")
    void unauthenticatedAccessToAdminOrders_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated request to /api/orders should return 401")
    void unauthenticatedAccessToOrders_returns401() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated request to mutate products should return 401")
    void unauthenticatedProductMutation_returns401() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Phone\",\"price\":999.99}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated request to mutate categories should return 401")
    void unauthenticatedCategoryMutation_returns401() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Electronics\"}"))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // 2. Customer Access to Admin Endpoints (Expect 403 Forbidden)
    // =========================================================================

    @Test
    @DisplayName("Customer accessing /api/admin/products should return 403")
    void customerAccessToAdminProducts_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer accessing /api/admin/orders should return 403")
    void customerAccessToAdminOrders_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer accessing /api/admin/categories should return 403")
    void customerAccessToAdminCategories_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/categories")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer accessing /api/admin/coupons should return 403")
    void customerAccessToAdminCoupons_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/coupons")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer accessing /api/admin/dashboard/stats should return 403")
    void customerAccessToAdminDashboard_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 3. Customer Attempting to Mutate Products (Expect 403 Forbidden)
    // =========================================================================

    @Test
    @DisplayName("Customer creating product via POST /api/products should return 403")
    void customerCreatingProduct_returns403() throws Exception {
        mockMvc.perform(post("/api/products")
                        .header("Authorization", getCustomerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Laptop\",\"price\":1200}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer updating product via PUT /api/products/1 should return 403")
    void customerUpdatingProduct_returns403() throws Exception {
        mockMvc.perform(put("/api/products/1")
                        .header("Authorization", getCustomerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Laptop\",\"price\":1100}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer deleting product via DELETE /api/products/1 should return 403")
    void customerDeletingProduct_returns403() throws Exception {
        mockMvc.perform(delete("/api/products/1")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 4. Customer Attempting to Mutate Categories (Expect 403 Forbidden)
    // =========================================================================

    @Test
    @DisplayName("Customer creating category via POST /api/categories should return 403")
    void customerCreatingCategory_returns403() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .header("Authorization", getCustomerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Smartphones\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer updating category via PUT /api/categories/1 should return 403")
    void customerUpdatingCategory_returns403() throws Exception {
        mockMvc.perform(put("/api/categories/1")
                        .header("Authorization", getCustomerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Smartphones\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer deleting category via DELETE /api/categories/1 should return 403")
    void customerDeletingCategory_returns403() throws Exception {
        mockMvc.perform(delete("/api/categories/1")
                        .header("Authorization", getCustomerToken()))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 5. Customer Attempting to Change Order Status (Expect 403 Forbidden)
    // =========================================================================

    @Test
    @DisplayName("Customer mutating order status via PUT /api/orders/1/status should return 403")
    void customerMutatingOrderStatus_returns403() throws Exception {
        mockMvc.perform(put("/api/orders/1/status")
                        .header("Authorization", getCustomerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DELIVERED\"}"))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 6. Public Endpoints Accessible Unauthenticated (Expect 200 OK)
    // =========================================================================

    @Test
    @DisplayName("Public GET /api/products should return 200")
    void publicGetProducts_returns200() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public GET /api/categories should return 200")
    void publicGetCategories_returns200() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());
    }
}
