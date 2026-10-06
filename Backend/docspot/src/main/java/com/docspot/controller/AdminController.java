package com.docspot.controller;

import com.docspot.dto.AdminUserResponse;
import com.docspot.dto.AppointmentResponse;
import com.docspot.entity.Appointment;
import com.docspot.entity.Role;
import com.docspot.entity.User;

import com.docspot.service.NotificationService;

import com.docspot.entity.AccountStatus;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.docspot.repository.AppointmentRepository;
import com.docspot.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docspot.dto.AdminDashboardResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
private final AppointmentRepository appointmentRepository;
private final NotificationService notificationService;

    public AdminController(
        UserRepository userRepository,
        AppointmentRepository appointmentRepository,
        NotificationService notificationService) {

    this.userRepository = userRepository;
    this.appointmentRepository = appointmentRepository;
    this.notificationService = notificationService;
}

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {

        List<AdminUserResponse> users = userRepository.findAll()
                .stream()
                .map(this::convertToUserResponse)
                .toList();

        return ResponseEntity.ok(users);
    }

    // Get all patients
    @GetMapping("/patients")
    public ResponseEntity<List<AdminUserResponse>> getAllPatients() {

        List<AdminUserResponse> patients = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.PATIENT)
                .map(this::convertToUserResponse)
                .toList();

        return ResponseEntity.ok(patients);
    }

    // Get all doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<AdminUserResponse>> getAllDoctors() {

        List<AdminUserResponse> doctors = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.DOCTOR)
                .map(this::convertToUserResponse)
                .toList();

        return ResponseEntity.ok(doctors);
    }

    // Get pending doctor registration requests
@GetMapping("/pending-doctors")
public ResponseEntity<List<AdminUserResponse>> getPendingDoctors() {

    List<AdminUserResponse> pendingDoctors =
            userRepository.findByRoleAndAccountStatus(
                    Role.DOCTOR,
                    AccountStatus.PENDING
            )
            .stream()
            .map(this::convertToUserResponse)
            .toList();

    return ResponseEntity.ok(pendingDoctors);
}


// Approve a pending doctor
@PutMapping("/doctors/{userId}/approve")
public ResponseEntity<String> approveDoctor(
        @PathVariable Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole() != Role.DOCTOR) {
        throw new RuntimeException("User is not a doctor");
    }

    if (user.getAccountStatus() != AccountStatus.PENDING) {
        throw new RuntimeException(
                "Doctor is not pending approval");
    }

    // Change status to ACTIVE
    user.setAccountStatus(AccountStatus.ACTIVE);
    userRepository.save(user);

    // Notify doctor
    notificationService.createNotification(
            user.getId(),
            "Admin approved your doctor registration request. Please complete your Manage Availability section so patients can book appointments with you.",
            "DOCTOR_APPROVED");

    return ResponseEntity.ok(
            "Doctor approved successfully");
}

// Reject a pending doctor
@PutMapping("/doctors/{userId}/reject")
public ResponseEntity<String> rejectDoctor(
        @PathVariable Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (user.getRole() != Role.DOCTOR) {
        throw new RuntimeException("User is not a doctor");
    }

    if (user.getAccountStatus() != AccountStatus.PENDING) {
        throw new RuntimeException(
                "Doctor is not pending approval");
    }

    // Change status to REJECTED
    user.setAccountStatus(AccountStatus.REJECTED);
    userRepository.save(user);

    // Notify doctor
    notificationService.createNotification(
            user.getId(),
            "Admin rejected your doctor registration request.",
            "DOCTOR_REJECTED"
    );

    return ResponseEntity.ok(
            "Doctor rejected successfully"
    );
}



    // Get all appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {

        List<AppointmentResponse> appointments =
                appointmentRepository.findAll()
                        .stream()
                        .map(this::convertToAppointmentResponse)
                        .toList();

        return ResponseEntity.ok(appointments);
    }

    // Convert User entity to safe response
    private AdminUserResponse convertToUserResponse(User user) {
    return new AdminUserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getAccountStatus(),
            user.getCreatedAt()
    );
}

    // Convert Appointment entity to response
    private AppointmentResponse convertToAppointmentResponse(
            Appointment appointment) {

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getPatient().getId(),
                appointment.getPatient().getName(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getUser().getName(),
                appointment.getDoctor().getSpecialization(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getStatus(),
                appointment.getReason());
    }
    
// Get Admin Dashboard Statistics
@GetMapping("/dashboard")
public ResponseEntity<AdminDashboardResponse> getDashboardStats() {

    long totalUsers = userRepository.count();

    long totalPatients = userRepository.findAll()
            .stream()
            .filter(user -> user.getRole() == Role.PATIENT)
            .count();

    long totalDoctors = userRepository.findAll()
            .stream()
            .filter(user -> user.getRole() == Role.DOCTOR)
            .count();

    long totalAppointments = appointmentRepository.count();

    AdminDashboardResponse response = new AdminDashboardResponse(
            totalUsers,
            totalPatients,
            totalDoctors,
            totalAppointments
    );

    return ResponseEntity.ok(response);
}

// ================= BLOCK DOCTOR =================

@PutMapping("/doctors/{userId}/block")
public ResponseEntity<String> blockDoctor(
        @PathVariable Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (user.getRole() != Role.DOCTOR) {
        throw new RuntimeException("User is not a doctor");
    }

    if (user.getAccountStatus() != AccountStatus.ACTIVE) {
        throw new RuntimeException(
                "Only an active doctor can be blocked");
    }

    user.setAccountStatus(AccountStatus.BLOCKED);
    userRepository.save(user);

    notificationService.createNotification(
            user.getId(),
            "Your doctor account has been blocked by Admin. You cannot login or receive new appointments until your account is unblocked.",
            "DOCTOR_BLOCKED"
    );

    return ResponseEntity.ok(
            "Doctor blocked successfully"
    );
}


// ================= UNBLOCK DOCTOR =================

@PutMapping("/doctors/{userId}/unblock")
public ResponseEntity<String> unblockDoctor(
        @PathVariable Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (user.getRole() != Role.DOCTOR) {
        throw new RuntimeException("User is not a doctor");
    }

    if (user.getAccountStatus() != AccountStatus.BLOCKED) {
        throw new RuntimeException(
                "Doctor is not blocked");
    }

    user.setAccountStatus(AccountStatus.ACTIVE);
    userRepository.save(user);

    notificationService.createNotification(
            user.getId(),
            "Your doctor account has been unblocked by Admin. You can now login and receive appointments again.",
            "DOCTOR_UNBLOCKED"
    );

    return ResponseEntity.ok(
            "Doctor unblocked successfully"
    );
}

}