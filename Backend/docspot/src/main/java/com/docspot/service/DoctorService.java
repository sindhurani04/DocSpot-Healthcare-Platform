package com.docspot.service;

import com.docspot.entity.Doctor;
import com.docspot.entity.User;
import com.docspot.repository.DoctorRepository;
import com.docspot.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            UserRepository userRepository) {

        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
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

    // Get all doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
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
                );
    }

    // Get doctor by User ID
    public Doctor getDoctorByUserId(Long userId) {

        return doctorRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor profile not found"));
    }
}