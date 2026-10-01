package com.docspot.service;

import com.docspot.entity.Doctor;
import com.docspot.entity.DoctorAvailability;
import com.docspot.repository.DoctorAvailabilityRepository;
import com.docspot.repository.DoctorRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.Set;
import java.util.List;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository) {

        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
    }

    // Add doctor availability
    public DoctorAvailability addAvailability(
            Long doctorId,
            LocalDate availableDate,
            LocalTime startTime,
            LocalTime endTime) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException(
                    "Start time must be before end time");
        }

        DoctorAvailability availability =
                new DoctorAvailability(
                        doctor,
                        availableDate,
                        startTime,
                        endTime
                );

        return availabilityRepository.save(availability);
    }

    // Get all availability for a doctor
    public List<DoctorAvailability> getDoctorAvailability(
            Long doctorId) {

        return availabilityRepository
                .findByDoctorId(doctorId);
    }

    // Get availability for a doctor on a specific date
    public List<DoctorAvailability> getAvailabilityByDate(
            Long doctorId,
                    LocalDate date) {

            return availabilityRepository
                            .findByDoctorIdAndAvailableDate(
                                            doctorId,
                                            date);
    }
    // Generate recurring weekly availability
public List<DoctorAvailability> generateWeeklyAvailability(
        Long doctorId,
        LocalDate startDate,
        LocalDate endDate,
        Set<DayOfWeek> availableDays,
        LocalTime startTime,
        LocalTime endTime) {

    Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() ->
                    new RuntimeException("Doctor not found"));

    if (!startTime.isBefore(endTime)) {
        throw new RuntimeException(
                "Start time must be before end time");
    }

    if (startDate.isAfter(endDate)) {
        throw new RuntimeException(
                "Start date must be before or equal to end date");
    }

    List<DoctorAvailability> generatedAvailability =
            new java.util.ArrayList<>();

    LocalDate currentDate = startDate;

    while (!currentDate.isAfter(endDate)) {

        if (availableDays.contains(currentDate.getDayOfWeek())) {

            List<DoctorAvailability> existing =
                    availabilityRepository
                            .findByDoctorIdAndAvailableDate(
                                    doctorId,
                                    currentDate
                            );

            if (existing.isEmpty()) {

                DoctorAvailability availability =
                        new DoctorAvailability(
                                doctor,
                                currentDate,
                                startTime,
                                endTime
                        );

                generatedAvailability.add(
                        availabilityRepository.save(availability)
                );
            }
        }

        currentDate = currentDate.plusDays(1);
    }

    return generatedAvailability;
}
}