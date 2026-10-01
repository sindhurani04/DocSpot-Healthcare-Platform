package com.docspot.controller;

import com.docspot.dto.AvailabilityResponse;
import com.docspot.entity.DoctorAvailability;
import com.docspot.service.DoctorAvailabilityService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.Set;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    public DoctorAvailabilityController(
            DoctorAvailabilityService availabilityService) {

        this.availabilityService = availabilityService;
    }

    // Convert entity to safe response
    private AvailabilityResponse convertToResponse(
            DoctorAvailability availability) {

        return new AvailabilityResponse(
                availability.getId(),
                availability.getDoctor().getId(),
                availability.getDoctor().getUser().getName(),
                availability.getDoctor().getSpecialization(),
                availability.getAvailableDate(),
                availability.getStartTime(),
                availability.getEndTime()
        );
    }

    // Add availability
    @PostMapping
    public ResponseEntity<AvailabilityResponse> addAvailability(
            @RequestParam Long doctorId,
            @RequestParam LocalDate availableDate,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime) {

        DoctorAvailability availability =
                availabilityService.addAvailability(
                        doctorId,
                        availableDate,
                        startTime,
                        endTime
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(availability));
    }

    // Get all availability for a doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AvailabilityResponse>>
            getDoctorAvailability(
                    @PathVariable Long doctorId) {

        List<AvailabilityResponse> response =
                availabilityService
                        .getDoctorAvailability(doctorId)
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    // Get availability for a doctor on a specific date
    @GetMapping("/doctor/{doctorId}/date")
    public ResponseEntity<List<AvailabilityResponse>>
            getAvailabilityByDate(
                    @PathVariable Long doctorId,
                                    @RequestParam LocalDate date) {

            List<AvailabilityResponse> response = availabilityService
                            .getAvailabilityByDate(
                                            doctorId,
                                            date)
                            .stream()
                            .map(this::convertToResponse)
                            .toList();

            return ResponseEntity.ok(response);
    }
    @PostMapping("/weekly")
public ResponseEntity<List<AvailabilityResponse>> generateWeeklyAvailability(
        @RequestParam Long doctorId,
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate,
        @RequestParam Set<DayOfWeek> availableDays,
        @RequestParam LocalTime startTime,
        @RequestParam LocalTime endTime) {

    List<DoctorAvailability> generated =
            availabilityService.generateWeeklyAvailability(
                    doctorId,
                    startDate,
                    endDate,
                    availableDays,
                    startTime,
                    endTime
            );

    List<AvailabilityResponse> response = generated
            .stream()
            .map(this::convertToResponse)
            .toList();

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
}
}