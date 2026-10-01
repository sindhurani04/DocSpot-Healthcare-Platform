package com.docspot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
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
            String email = jwtService.extractEmail(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            java.util.Collections.emptyList()
                    );

            SecurityContextHolder.getContext()
        .setAuthentication(authentication);

System.out.println("========== JWT SUCCESS ==========");
System.out.println("Request Method: " + request.getMethod());
System.out.println("Request URI: " + request.getRequestURI());
System.out.println("Authenticated Email: " + email);
System.out.println("Authentication: "
        + SecurityContextHolder.getContext().getAuthentication());
System.out.println("Authenticated: "
        + SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
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