package com.docspot.config;

import com.docspot.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            
    .csrf(csrf -> csrf.disable())
    .cors(cors -> {})
    .authorizeHttpRequests(auth -> auth
    .requestMatchers(
        "/api/health",
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/register-doctor"
    ).permitAll()

    .requestMatchers("/api/admin/**")
    .hasRole("ADMIN")

    .anyRequest().authenticated()
)

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // Add JWT filter before Spring's username/password filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}