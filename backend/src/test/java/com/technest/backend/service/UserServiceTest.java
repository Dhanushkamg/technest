package com.technest.backend.service;

import com.technest.backend.dto.UpdateProfileRequest;
import com.technest.backend.dto.UserProfileResponse;
import com.technest.backend.entity.User;
import com.technest.backend.exception.ResourceNotFoundException;
import com.technest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("user@example.com");
        user.setPassword("hashedpassword");
        user.setRole("USER");
        user.setPhoneNumber("1234567890");
    }

    @Test
    void getUserProfile_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getUserProfile("user@example.com");

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test User");
        assertThat(response.getEmail()).isEqualTo("user@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getPhoneNumber()).isEqualTo("1234567890");
    }

    @Test
    void getUserProfile_userNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserProfile("unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateUserProfile_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Updated Name");
        request.setPhoneNumber("0987654321");

        UserProfileResponse response = userService.updateUserProfile("user@example.com", request);

        assertThat(response.getName()).isEqualTo("Updated Name");
        assertThat(response.getPhoneNumber()).isEqualTo("0987654321");
        
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("hashedpassword", "hashedpassword")).thenReturn(true);
        when(passwordEncoder.matches("newpassword123", "hashedpassword")).thenReturn(false);
        when(passwordEncoder.encode("newpassword123")).thenReturn("newhashedpassword");

        com.technest.backend.dto.ChangePasswordRequest request = new com.technest.backend.dto.ChangePasswordRequest();
        request.setCurrentPassword("hashedpassword");
        request.setNewPassword("newpassword123");

        userService.changePassword("user@example.com", request);

        assertThat(user.getPassword()).isEqualTo("newhashedpassword");
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_incorrectCurrentPassword() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashedpassword")).thenReturn(false);

        com.technest.backend.dto.ChangePasswordRequest request = new com.technest.backend.dto.ChangePasswordRequest();
        request.setCurrentPassword("wrongpassword");
        request.setNewPassword("newpassword123");

        assertThatThrownBy(() -> userService.changePassword("user@example.com", request))
                .isInstanceOf(com.technest.backend.exception.BadRequestException.class)
                .hasMessage("Incorrect current password");
    }

    @Test
    void changePassword_samePassword() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("hashedpassword", "hashedpassword")).thenReturn(true);

        com.technest.backend.dto.ChangePasswordRequest request = new com.technest.backend.dto.ChangePasswordRequest();
        request.setCurrentPassword("hashedpassword");
        request.setNewPassword("hashedpassword");

        assertThatThrownBy(() -> userService.changePassword("user@example.com", request))
                .isInstanceOf(com.technest.backend.exception.BadRequestException.class)
                .hasMessage("New password cannot be the same as the current password");
    }
}
