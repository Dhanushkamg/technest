package com.technest.backend.controller;

import com.technest.backend.dto.JwtAuthResponse;
import com.technest.backend.dto.LoginRequest;
import com.technest.backend.dto.LoginResponse;
import com.technest.backend.dto.RegisterRequest;
import com.technest.backend.dto.RegisterResponse;
import com.technest.backend.dto.ForgotPasswordRequest;
import com.technest.backend.dto.ResetPasswordRequest;
import com.technest.backend.entity.User;
import com.technest.backend.service.UserService;
import com.technest.backend.service.JwtService;
import com.technest.backend.service.RefreshTokenService;
import com.technest.backend.entity.RefreshToken;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(UserService userService, JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        User createdUser = userService.register(request);
        RegisterResponse response = new RegisterResponse(
                createdUser.getId(),
                createdUser.getName(),
                createdUser.getEmail(),
                createdUser.getRole()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtAuthResponse authResponse = userService.login(request);

        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", authResponse.getAccessToken())
                .httpOnly(true)
                .secure(false) // set to true in production with HTTPS
                .path("/")
                .maxAge(24 * 60 * 60) // 1 day
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false) // set to true in production
                .path("/api/v1/auth/refresh")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(authResponse.getUserDetails());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(
            @org.springframework.web.bind.annotation.CookieValue(name = "refreshToken", required = false) String refreshTokenString) {
        
        if (refreshTokenString == null || refreshTokenString.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return refreshTokenService.findByToken(refreshTokenString)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtService.generateToken(user.getEmail(), user.getRole());
                    ResponseCookie jwtCookie = ResponseCookie.from("accessToken", token)
                            .httpOnly(true)
                            .secure(false)
                            .path("/")
                            .maxAge(24 * 60 * 60)
                            .sameSite("Strict")
                            .build();

                    LoginResponse loginResponse = new LoginResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getRole()
                    );
                    
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                            .body(loginResponse);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @org.springframework.web.bind.annotation.CookieValue(name = "refreshToken", required = false) String refreshTokenString) {
        
        if (refreshTokenString != null && !refreshTokenString.isEmpty()) {
            refreshTokenService.findByToken(refreshTokenString).ifPresent(token -> {
                refreshTokenService.deleteByUserId(token.getUser().getId());
            });
        }

        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth/refresh")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
