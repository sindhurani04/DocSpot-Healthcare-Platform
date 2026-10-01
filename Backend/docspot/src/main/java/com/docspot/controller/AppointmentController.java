package com.docspot.controller;
import com.docspot.dto.AppointmentStatusRequest;
import com.docspot.dto.AppointmentRequest;
import com.docspot.dto.AppointmentResponse;
import com.docspot.entity.Appointment;
import com.docspot.service.AppointmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    private AppointmentResponse convertToResponse(Appointment appointment) {

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
                appointment.getReason()
        );
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @RequestParam Long patientId,
            @RequestBody AppointmentRequest request) {

        Appointment appointment = appointmentService.bookAppointment(
                patientId,
                request.getDoctorId(),
                request.getAppointmentDate(),
                request.getAppointmentTime(),
                request.getReason()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(appointment));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(
            @PathVariable Long patientId) {

        List<AppointmentResponse> appointments =
                appointmentService.getPatientAppointments(patientId)
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(
                    @PathVariable Long doctorId) {

            List<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctorId)
                            .stream()
                            .map(this::convertToResponse)
                            .toList();

            return ResponseEntity.ok(appointments);
    }
    @GetMapping("/doctor/{doctorId}/booked-slots")
public ResponseEntity<List<java.time.LocalTime>> getBookedSlots(
        @PathVariable Long doctorId,
        @RequestParam java.time.LocalDate date) {

    return ResponseEntity.ok(
            appointmentService.getBookedSlots(
                    doctorId,
                    date
            )
    );
}

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable Long id) {

        Appointment appointment =
                appointmentService.getAppointmentById(id);

        return ResponseEntity.ok(convertToResponse(appointment));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long id) {

        Appointment appointment = appointmentService.cancelAppointment(id);

        return ResponseEntity.ok(convertToResponse(appointment));
    }
    @PutMapping("/{id}/status")
public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
        @PathVariable Long id,
        @RequestBody AppointmentStatusRequest request) {

    Appointment appointment =
            appointmentService.updateAppointmentStatus(
                    id,
                    request.getStatus()
            );

    return ResponseEntity.ok(convertToResponse(appointment));
}



}
