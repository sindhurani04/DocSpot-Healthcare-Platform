package com.docspot.dto;

import com.docspot.entity.AccountStatus;
import com.docspot.entity.Role;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private AccountStatus accountStatus;
    private LocalDateTime createdAt;

    public AdminUserResponse(
            Long id,
            String name,
            String email,
            Role role,
            AccountStatus accountStatus,
            LocalDateTime createdAt) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}