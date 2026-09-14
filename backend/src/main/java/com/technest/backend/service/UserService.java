package com.technest.backend.service;

import com.technest.backend.dto.JwtAuthResponse;
import com.technest.backend.dto.LoginRequest;
import com.technest.backend.dto.LoginResponse;
import com.technest.backend.dto.RegisterRequest;
import com.technest.backend.dto.UpdateProfileRequest;
import com.technest.backend.dto.UserProfileResponse;
import com.technest.backend.entity.User;
import com.technest.backend.entity.VerificationToken;
import com.technest.backend.entity.PasswordResetToken;
import com.technest.backend.repository.UserRepository;
import com.technest.backend.repository.VerificationTokenRepository;
import com.technest.backend.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.technest.backend.exception.BadRequestException;
import com.technest.backend.exception.UnauthorizedException;
import com.technest.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, RefreshTokenService refreshTokenService, VerificationTokenRepository verificationTokenRepository, PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        VerificationToken vToken = new VerificationToken();
        vToken.setUser(savedUser);
        vToken.setToken(UUID.randomUUID().toString());
        vToken.setExpiryDate(Instant.now().plusMillis(24 * 60 * 60 * 1000)); // 24 hours
        verificationTokenRepository.save(vToken);

        emailService.sendVerificationEmail(savedUser.getEmail(), vToken.getToken());

        return savedUser;
    }

    public JwtAuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isVerified() && "LOCAL".equals(user.getAuthProvider())) {
            throw new UnauthorizedException("Email is not verified. Please check your inbox.");
        }

        String accessToken = jwtService.generateToken(user.getEmail(), user.getRole());
        
        refreshTokenService.deleteByUserId(user.getId());
        com.technest.backend.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        LoginResponse loginResponse = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        return new JwtAuthResponse(accessToken, refreshToken.getToken(), loginResponse);
    }

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber()
        );
    }

    public UserProfileResponse updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());

        User updatedUser = userRepository.save(user);

        return new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getPhoneNumber()
        );
    }

    public void changePassword(String email, com.technest.backend.dto.ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password cannot be the same as the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void verifyEmail(String token) {
        VerificationToken vToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (vToken.getExpiryDate().isBefore(Instant.now())) {
            verificationTokenRepository.delete(vToken);
            throw new BadRequestException("Verification token has expired");
        }

        User user = vToken.getUser();
        user.setVerified(true);
        userRepository.save(user);
        verificationTokenRepository.delete(vToken);
    }

    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            PasswordResetToken pToken = new PasswordResetToken();
            pToken.setUser(user);
            pToken.setToken(UUID.randomUUID().toString());
            pToken.setExpiryDate(Instant.now().plusMillis(24 * 60 * 60 * 1000)); // 24 hours
            passwordResetTokenRepository.save(pToken);

            emailService.sendPasswordResetEmail(user.getEmail(), pToken.getToken());
        });
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken pToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (pToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(pToken);
            throw new BadRequestException("Password reset token has expired");
        }

        User user = pToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(pToken);
    }
}
