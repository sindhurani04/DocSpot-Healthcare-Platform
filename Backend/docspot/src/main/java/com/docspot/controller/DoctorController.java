package com.docspot.controller;

import com.docspot.dto.DoctorRequest;
import com.docspot.dto.DoctorResponse;
import com.docspot.entity.Doctor;
import com.docspot.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Convert Doctor entity to safe DoctorResponse
    private DoctorResponse convertToResponse(Doctor doctor) {

        return new DoctorResponse(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getUser().getRole(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperience(),
                doctor.getConsultationFee(),
                doctor.getClinicName(),
                doctor.getClinicAddress(),
                doctor.getAbout()
        );
    }

    // Create doctor profile
    @PostMapping
    public ResponseEntity<DoctorResponse> createDoctor(
            @RequestBody DoctorRequest request) {

        Doctor doctor = doctorService.createDoctor(
                request.getUserId(),
                request.getSpecialization(),
                request.getQualification(),
                request.getExperience(),
                request.getConsultationFee(),
                request.getClinicName(),
                request.getClinicAddress(),
                request.getAbout()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(doctor));
    }

    // Get all doctors
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {

        List<DoctorResponse> doctors =
                doctorService.getAllDoctors()
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(doctors);
    }

    // Get doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(
            @PathVariable Long id) {

        Doctor doctor = doctorService.getDoctorById(id);

        return ResponseEntity.ok(
                convertToResponse(doctor)
        );
    }

    // Search doctors by specialization
    @GetMapping("/search")
    public ResponseEntity<List<DoctorResponse>> searchDoctors(
            @RequestParam String specialization) {

        List<DoctorResponse> doctors =
                doctorService.searchBySpecialization(
                        specialization
                )
                .stream()
                .map(this::convertToResponse)
                .toList();

        return ResponseEntity.ok(doctors);
    }

    // Get doctor by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<DoctorResponse> getDoctorByUserId(
            @PathVariable Long userId) {

        Doctor doctor =
                doctorService.getDoctorByUserId(userId);

        return ResponseEntity.ok(
                convertToResponse(doctor)
        );
    }
}