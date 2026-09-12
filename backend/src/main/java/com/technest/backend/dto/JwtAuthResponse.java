package com.technest.backend.dto;

public class JwtAuthResponse {
    private String accessToken;
    private String refreshToken;
    private LoginResponse userDetails;

    public JwtAuthResponse(String accessToken, String refreshToken, LoginResponse userDetails) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userDetails = userDetails;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public LoginResponse getUserDetails() {
        return userDetails;
    }
}
