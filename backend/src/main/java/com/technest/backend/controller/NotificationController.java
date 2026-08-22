package com.technest.backend.controller;

import com.technest.backend.dto.NotificationResponse;
import com.technest.backend.dto.UnreadCountResponse;
import com.technest.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private String getAuthenticatedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        String email = getAuthenticatedUserEmail();
        return ResponseEntity.ok(notificationService.getUserNotifications(email));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount() {
        String email = getAuthenticatedUserEmail();
        return ResponseEntity.ok(notificationService.getUnreadCount(email));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        String email = getAuthenticatedUserEmail();
        notificationService.markAsRead(email, notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        String email = getAuthenticatedUserEmail();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok().build();
    }
}
