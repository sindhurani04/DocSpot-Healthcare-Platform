package com.docspot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilityResponse {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;

    public AvailabilityResponse() {
    }

    public AvailabilityResponse(
            Long id,
            Long doctorId,
            String doctorName,
            String specialization,
            LocalDate availableDate,
            LocalTime startTime,
            LocalTime endTime) {

        this.id = id;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.availableDate = availableDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() {
        return id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public LocalDate getAvailableDate() {
        return availableDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }
}