package com.technest.backend.service;

import com.technest.backend.dto.NotificationResponse;
import com.technest.backend.dto.UnreadCountResponse;
import com.technest.backend.entity.Notification;
import com.technest.backend.entity.NotificationType;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ForbiddenException;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.NotificationRepository;
import com.technest.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Internal method — called by other services to create a notification for a user.
     * Does NOT require the caller's email; the User object is passed directly.
     */
    @Transactional
    public void createNotification(User user, NotificationType type, String message) {
        createNotificationIdempotent(user, type, message, null);
    }

    @Transactional
    public void createNotificationIdempotent(User user, NotificationType type, String message, String deduplicationKey) {
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setMessage(message);
            notification.setDeduplicationKey(deduplicationKey);
            notificationRepository.saveAndFlush(notification);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Duplicate notification, ignore
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String email) {
        User user = resolveUser(email);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String email, Long notificationId) {
        User user = resolveUser(email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied: you can only mark your own notifications as read.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = resolveUser(email);
        notificationRepository.markAllAsReadForUser(user);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(String email) {
        User user = resolveUser(email);
        long count = notificationRepository.countByUserAndIsReadFalse(user);
        return new UnreadCountResponse(count);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse response = new NotificationResponse();
        response.setId(n.getId());
        response.setType(n.getType());
        response.setMessage(n.getMessage());
        response.setRead(n.isRead());
        response.setCreatedAt(n.getCreatedAt());
        return response;
    }
}
