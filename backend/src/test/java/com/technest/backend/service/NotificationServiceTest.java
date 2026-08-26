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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private User otherUser;
    private Notification notification1;
    private Notification notification2;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");

        notification1 = new Notification();
        notification1.setId(10L);
        notification1.setUser(user);
        notification1.setType(NotificationType.ORDER_CREATED);
        notification1.setMessage("Your order #1 has been placed successfully.");
        notification1.setRead(false);
        notification1.setCreatedAt(LocalDateTime.now().minusHours(1));

        notification2 = new Notification();
        notification2.setId(11L);
        notification2.setUser(user);
        notification2.setType(NotificationType.PAYMENT_SUCCESS);
        notification2.setMessage("Payment of 200.00 for order #1 was successful.");
        notification2.setRead(false);
        notification2.setCreatedAt(LocalDateTime.now());
    }

    // -------------------------------------------------------
    // createNotification
    // -------------------------------------------------------

    @Test
    void createNotification_savesNotification() {
        notificationService.createNotification(user, NotificationType.ORDER_CREATED, "Test message");

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    // -------------------------------------------------------
    // getUserNotifications
    // -------------------------------------------------------

    @Test
    void getUserNotifications_returnsNotificationsForUser() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        // Newest first: notification2 (recent), then notification1 (older)
        when(notificationRepository.findByUserOrderByCreatedAtDesc(user))
                .thenReturn(List.of(notification2, notification1));

        List<NotificationResponse> result = notificationService.getUserNotifications("user@example.com");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(11L);
        assertThat(result.get(0).getType()).isEqualTo(NotificationType.PAYMENT_SUCCESS);
        assertThat(result.get(1).getId()).isEqualTo(10L);
        assertThat(result.get(1).getType()).isEqualTo(NotificationType.ORDER_CREATED);
    }

    @Test
    void getUserNotifications_userNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.getUserNotifications("unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    // -------------------------------------------------------
    // markAsRead
    // -------------------------------------------------------

    @Test
    void markAsRead_ownNotification_marksRead() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification1));

        notificationService.markAsRead("user@example.com", 10L);

        assertThat(notification1.isRead()).isTrue();
        verify(notificationRepository, times(1)).save(notification1);
    }

    @Test
    void markAsRead_notificationNotFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead("user@example.com", 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Notification not found");
    }

    @Test
    void markAsRead_otherUsersNotification_throwsForbidden() {
        // notification1 belongs to `user`, but otherUser tries to mark it
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherUser));
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification1));

        assertThatThrownBy(() -> notificationService.markAsRead("other@example.com", 10L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");

        verify(notificationRepository, never()).save(any());
    }

    // -------------------------------------------------------
    // markAllAsRead
    // -------------------------------------------------------

    @Test
    void markAllAsRead_callsBulkUpdate() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        notificationService.markAllAsRead("user@example.com");

        verify(notificationRepository, times(1)).markAllAsReadForUser(user);
    }

    // -------------------------------------------------------
    // getUnreadCount
    // -------------------------------------------------------

    @Test
    void getUnreadCount_returnsCorrectCount() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.countByUserAndIsReadFalse(user)).thenReturn(2L);

        UnreadCountResponse result = notificationService.getUnreadCount("user@example.com");

        assertThat(result.getCount()).isEqualTo(2L);
    }

    @Test
    void getUnreadCount_noUnread_returnsZero() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(notificationRepository.countByUserAndIsReadFalse(user)).thenReturn(0L);

        UnreadCountResponse result = notificationService.getUnreadCount("user@example.com");

        assertThat(result.getCount()).isEqualTo(0L);
    }
}
