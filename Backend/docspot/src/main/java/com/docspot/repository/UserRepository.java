package com.docspot.repository;

import com.docspot.entity.AccountStatus;
import com.docspot.entity.Role;
import com.docspot.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    

    List<User> findByRoleAndAccountStatus(
            Role role,
            AccountStatus accountStatus
    );
    Optional<User> findByRole(Role role);
}