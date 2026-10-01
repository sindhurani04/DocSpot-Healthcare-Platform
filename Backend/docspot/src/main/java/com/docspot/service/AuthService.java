package com.docspot.service;

import com.docspot.entity.Role;
import com.docspot.entity.User;
import com.docspot.entity.Doctor;
import com.docspot.repository.DoctorRepository;
import com.docspot.repository.UserRepository;
import com.docspot.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
private final DoctorRepository doctorRepository;
private final PasswordEncoder passwordEncoder;
private final JwtService jwtService;
public AuthService(
        UserRepository userRepository,
        DoctorRepository doctorRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

    this.userRepository = userRepository;
    this.doctorRepository = doctorRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
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

    return savedUser;
}

// existing methods above...


public User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
}


}