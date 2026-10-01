package com.docspot.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @GetMapping("/profile")
    public String getProfile(Authentication authentication) {

        return "Logged in user: " + authentication.getName();
    }
}