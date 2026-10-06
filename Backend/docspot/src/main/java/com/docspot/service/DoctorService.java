package com.docspot.service;

import com.docspot.entity.Doctor;
import com.docspot.entity.User;
import com.docspot.repository.DoctorRepository;
import com.docspot.repository.UserRepository;
import com.docspot.entity.AccountStatus;


import com.docspot.repository.DoctorWeeklyScheduleRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
private final UserRepository userRepository;
private final DoctorWeeklyScheduleRepository scheduleRepository;
    public DoctorService(
        DoctorRepository doctorRepository,
        UserRepository userRepository,
        DoctorWeeklyScheduleRepository scheduleRepository) {

    this.doctorRepository = doctorRepository;
    this.userRepository = userRepository;
    this.scheduleRepository = scheduleRepository;
}

    // Create doctor profile
    public Doctor createDoctor(
            Long userId,
            String specialization,
            String qualification,
            Integer experience,
            Double consultationFee,
            String clinicName,
            String clinicAddress,
            String about) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != com.docspot.entity.Role.DOCTOR) {
            throw new RuntimeException(
                    "Only users with DOCTOR role can create a doctor profile");
        }

        if (doctorRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException(
                    "Doctor profile already exists");
        }

        Doctor doctor = new Doctor(
                user,
                specialization,
                qualification,
                experience,
                consultationFee,
                clinicName,
                clinicAddress,
                about
        );

        return doctorRepository.save(doctor);
    }

private boolean hasCompletedAvailability(Doctor doctor) {

    return scheduleRepository.findByDoctor(doctor)
            .stream()
            .anyMatch(schedule ->
                    schedule.isAvailable()
                    && schedule.getStartTime() != null
                    && schedule.getEndTime() != null
            );
}




    // Get all doctors
   public List<Doctor> getAllDoctors() {

    return doctorRepository.findAll()
            .stream()
            .filter(doctor ->
                    doctor.getUser().getAccountStatus() == AccountStatus.ACTIVE
            )
            .filter(this::hasCompletedAvailability)
            .toList();
}
    // Get doctor by ID
    public Doctor getDoctorById(Long id) {

        return doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));
    }

    // Search doctors by specialization
   public List<Doctor> searchBySpecialization(
        String specialization) {

    return doctorRepository
            .findBySpecializationContainingIgnoreCase(
                    specialization
            )
            .stream()
            .filter(doctor ->
                    doctor.getUser().getAccountStatus() == AccountStatus.ACTIVE
            )
            .filter(this::hasCompletedAvailability)
            .toList();
}

    // Get doctor by User ID
    public Doctor getDoctorByUserId(Long userId) {

        return doctorRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor profile not found"));
    }
}