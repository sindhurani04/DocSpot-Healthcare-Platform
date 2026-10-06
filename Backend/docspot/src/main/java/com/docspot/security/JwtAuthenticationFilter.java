package com.docspot.security;

import com.docspot.entity.User;
import com.docspot.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Check whether Authorization header exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token
        String token = authHeader.substring(7);

        try {
            // Extract email from JWT
            String email = jwtService.extractEmail(token);

            // Find user from database
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Convert user's role into Spring Security authority
            String authority = "ROLE_" + user.getRole().name();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(
                                    new SimpleGrantedAuthority(authority)
                            )
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            System.out.println("========== JWT SUCCESS ==========");
            System.out.println("Request Method: " + request.getMethod());
            System.out.println("Request URI: " + request.getRequestURI());
            System.out.println("Authenticated Email: " + email);
            System.out.println("User Role: " + user.getRole());
            System.out.println("Authority: " + authority);
            System.out.println("Authentication: "
                    + SecurityContextHolder.getContext()
                    .getAuthentication());
            System.out.println("Authenticated: "
                    + SecurityContextHolder.getContext()
                    .getAuthentication()
                    .isAuthenticated());
            System.out.println("================================");

        } catch (Exception e) {

            System.out.println("========== JWT ERROR ==========");
            System.out.println("Error Type: " + e.getClass().getName());
            System.out.println("Error Message: " + e.getMessage());
            System.out.println("FULL ERROR = " + e);
            System.out.println("================================");
        }

        filterChain.doFilter(request, response);
    }
}