package com.docspot.service;

import com.docspot.entity.Role;
import com.docspot.entity.User;
import com.docspot.entity.Doctor;
import com.docspot.entity.AccountStatus;
import com.docspot.repository.DoctorRepository;
import com.docspot.repository.UserRepository;
import com.docspot.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
// import com.docspot.service.NotificationService;


@Service
public class AuthService {

    private final UserRepository userRepository;
private final DoctorRepository doctorRepository;
private final PasswordEncoder passwordEncoder;
private final JwtService jwtService;
private final NotificationService notificationService;
public AuthService(
        UserRepository userRepository,
        DoctorRepository doctorRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        NotificationService notificationService) {

    this.userRepository = userRepository;
    this.doctorRepository = doctorRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.notificationService = notificationService;
}

    // Registration
    public User register(String name, String email, String password) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(
                name,
                email,
                encodedPassword,
                Role.PATIENT
        );

        return userRepository.save(user);
    }

    // Login
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
    throw new RuntimeException("Invalid email or password");
}

if (user.getRole() == Role.DOCTOR &&
        user.getAccountStatus() != AccountStatus.ACTIVE) {

    if (user.getAccountStatus() == AccountStatus.PENDING) {
        throw new RuntimeException(
                "Your doctor account is awaiting Admin approval."
        );
    }

    if (user.getAccountStatus() == AccountStatus.REJECTED) {
        throw new RuntimeException(
                "Your doctor registration was rejected by Admin."
        );
    }

    if (user.getAccountStatus() == AccountStatus.BLOCKED) {
        throw new RuntimeException(
                "Your doctor account has been blocked by Admin."
        );
    }
}

return jwtService.generateToken(user.getEmail());
    }
    
// Doctor registration
public User registerDoctor(
        String name,
        String email,
        String password,
        String specialization,
        String qualification,
        Integer experience,
        Double consultationFee,
        String clinicName,
        String clinicAddress,
        String about) {

    if (userRepository.existsByEmail(email)) {
        throw new RuntimeException("Email already registered");
    }

    String encodedPassword = passwordEncoder.encode(password);

    User user = new User(
            name,
            email,
            encodedPassword,
            Role.DOCTOR
    );

    user.setAccountStatus(AccountStatus.PENDING);

    User savedUser = userRepository.save(user);

    Doctor doctor = new Doctor(
            savedUser,
            specialization,
            qualification,
            experience,
            consultationFee,
            clinicName,
            clinicAddress,
            about
    );

    doctorRepository.save(doctor);

// Notify Admin about new doctor registration
User admin = userRepository.findByRole(Role.ADMIN)
        .orElseThrow(() ->
                new RuntimeException("Admin user not found"));

notificationService.createNotification(
        admin.getId(),
        "New doctor registration request from Dr. " + savedUser.getName(),
        "DOCTOR_REGISTRATION"
);

return savedUser;
}

// existing methods above...


public User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
}


}