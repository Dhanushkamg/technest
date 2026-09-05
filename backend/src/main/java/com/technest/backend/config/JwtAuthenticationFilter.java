package com.technest.backend.config;

import com.technest.backend.repository.UserRepository;
import com.technest.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);
                
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String role = jwtService.extractRole(token);
                    if (role == null || role.isBlank()) {
                        role = userRepository.findByEmail(email)
                                .map(u -> u.getRole())
                                .orElse("USER");
                    }

                    java.util.List<org.springframework.security.core.GrantedAuthority> authorities;

                    if (role != null && (role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("ROLE_ADMIN"))) {
                        authorities = java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CUSTOMER")
                        );
                    } else {
                        authorities = java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CUSTOMER"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")
                        );
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            authorities
                    );
                    authToken.setDetails(new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is invalid or expired; just don't authenticate this request.
            // The SecurityFilterChain will handle rejecting the request if the route is protected.
        }

        filterChain.doFilter(request, response);
    }
}
