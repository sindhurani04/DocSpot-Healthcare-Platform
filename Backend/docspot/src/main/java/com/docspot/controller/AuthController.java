package com.docspot.controller;

import com.docspot.dto.DoctorRegisterRequest;
import com.docspot.dto.LoginRequest;
import com.docspot.dto.RegisterRequest;
import com.docspot.dto.UserResponse;
import com.docspot.entity.User;
import com.docspot.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Registration
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        UserResponse response = new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getAccountStatus(),
        user.getCreatedAt()
);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody LoginRequest request) {

        String token = authService.login(
                request.getEmail(),
                request.getPassword());

        return ResponseEntity.ok(token);
    }

    // Doctor registration
    @PostMapping("/register-doctor")
public ResponseEntity<UserResponse> registerDoctor(
        @RequestBody DoctorRegisterRequest request) {

    User user = authService.registerDoctor(
            request.getName(),
            request.getEmail(),
            request.getPassword(),
            request.getSpecialization(),
            request.getQualification(),
            request.getExperience(),
            request.getConsultationFee(),
            request.getClinicName(),
            request.getClinicAddress(),
            request.getAbout()
    );

    UserResponse response = new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getAccountStatus(),
        user.getCreatedAt()
);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
}
    // Profile
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> profile(
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        User user = authService.getUserByEmail(email);

        UserResponse response = new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getAccountStatus(),
        user.getCreatedAt()
);

        return ResponseEntity.ok(response);
    }
}