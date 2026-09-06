package com.technest.backend.controller;

import com.technest.backend.dto.DashboardResponse;
import com.technest.backend.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/admin/dashboard
     * Returns a summary of key business metrics with optional date filtering.
     * Requires authentication; admin role enforced by service layer.
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String range,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(dashboardService.getDashboard(email, range, startDate, endDate));
    }
}
