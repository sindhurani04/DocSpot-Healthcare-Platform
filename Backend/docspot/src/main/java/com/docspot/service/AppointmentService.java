package com.docspot.service;

import com.docspot.entity.Appointment;
import com.docspot.entity.AppointmentStatus;

import com.docspot.entity.AccountStatus;

import com.docspot.entity.Doctor;
import com.docspot.entity.DoctorWeeklySchedule;
import com.docspot.entity.User;
import com.docspot.repository.AppointmentRepository;
import com.docspot.repository.DoctorRepository;
import com.docspot.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


// private String formatDoctorName(String name) {
//     if (name == null || name.trim().isEmpty()) {
//         return "";
//     }

//     String trimmedName = name.trim();

//     if (trimmedName.matches("(?i)^Dr\\.\\s+.*")) {
//         return trimmedName;
//     }

//     return "Dr. " + trimmedName;
// }



@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorWeeklyScheduleService weeklyScheduleService;
    private final NotificationService notificationService;

    private String formatDoctorName(String name) {
    if (name == null || name.trim().isEmpty()) {
        return "";
    }

    String trimmedName = name.trim();

    if (trimmedName.matches("(?i)^Dr\\.\\s+.*")) {
        return trimmedName;
    }

    return "Dr. " + trimmedName;
}

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            DoctorWeeklyScheduleService weeklyScheduleService,
            NotificationService notificationService) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.weeklyScheduleService = weeklyScheduleService;
        this.notificationService = notificationService;
    }

    // =========================================================
    // BOOK APPOINTMENT
    // =========================================================

    public Appointment bookAppointment(
            Long patientId,
            Long doctorId,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            String reason) {

        User patient = userRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));


        // Only ACTIVE doctors can receive appointments
        if (doctor.getUser().getAccountStatus() != AccountStatus.ACTIVE) {
                throw new RuntimeException(
                                "Appointments can only be booked with active doctors");
        }

        

// Prevent booking a past appointment time
LocalDate today = LocalDate.now();
LocalTime now = LocalTime.now();

if (appointmentDate.isBefore(today) ||
        (appointmentDate.isEqual(today) &&
         !appointmentTime.isAfter(now))) {

    throw new RuntimeException(
            "Appointment time has already passed. Please select a future slot."
    );
}



        // =====================================================
        // CHECK DOCTOR WEEKLY SCHEDULE
        // =====================================================

        DoctorWeeklySchedule schedule =
                weeklyScheduleService.getScheduleForDate(
                        doctorId,
                        appointmentDate
                );

        if (schedule == null || !schedule.isAvailable()) {
            throw new RuntimeException(
                    "Doctor is not available on the selected date"
            );
        }

        // Check whether selected time is inside doctor's
        // working hours.
        boolean isWithinAvailability =
                !appointmentTime.isBefore(schedule.getStartTime())
                        && appointmentTime.isBefore(schedule.getEndTime());

        if (!isWithinAvailability) {
            throw new RuntimeException(
                    "Doctor is not available at the selected date and time"
            );
        }

        // =====================================================
        // PREVENT DOUBLE BOOKING
        // =====================================================

        boolean alreadyBooked =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                                doctorId,
                                appointmentDate,
                                appointmentTime
                        );

        if (alreadyBooked) {
            throw new RuntimeException(
                    "This appointment slot is already booked"
            );
        }

        // =====================================================
        // CREATE APPOINTMENT
        // =====================================================

        Appointment appointment = new Appointment(
                patient,
                doctor,
                appointmentDate,
                appointmentTime,
                AppointmentStatus.PENDING,
                reason
        );

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // =====================================================
        // NOTIFY DOCTOR
        // =====================================================

        notificationService.createNotification(
                doctor.getUser().getId(),
                "New appointment request from "
                        + patient.getName()
                        + " on "
                        + appointmentDate
                        + " at "
                        + appointmentTime,
                "APPOINTMENT"
        );

        return savedAppointment;
    }

    // =========================================================
    // GET PATIENT APPOINTMENTS
    // =========================================================

    public List<Appointment> getPatientAppointments(Long patientId) {

        return appointmentRepository.findByPatientId(patientId);
    }

    // =========================================================
    // GET DOCTOR APPOINTMENTS
    // =========================================================

    public List<Appointment> getDoctorAppointments(Long doctorId) {

            return appointmentRepository.findByDoctorId(doctorId);
    }
    // =========================================================
// GET BOOKED SLOTS FOR DOCTOR ON A SPECIFIC DATE
// =========================================================

public List<LocalTime> getBookedSlots(
        Long doctorId,
        LocalDate appointmentDate) {

    return appointmentRepository
            .findByDoctorIdAndAppointmentDate(
                    doctorId,
                    appointmentDate
            )
            .stream()
            .filter(appointment ->
                    appointment.getStatus() != AppointmentStatus.CANCELLED
            )
            .map(Appointment::getAppointmentTime)
            .toList();
}

    // =========================================================
    // GET APPOINTMENT BY ID
    // =========================================================

    public Appointment getAppointmentById(Long id) {

        return appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));
    }

    // =========================================================
    // PATIENT CANCELS APPOINTMENT
    // =========================================================

    public Appointment cancelAppointment(Long id) {

        Appointment appointment = getAppointmentById(id);

        appointment.setStatus(AppointmentStatus.CANCELLED);

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // Notify doctor that patient cancelled
        notificationService.createNotification(
                appointment.getDoctor().getUser().getId(),
                appointment.getPatient().getName()
                        + " has cancelled the appointment on "
                        + appointment.getAppointmentDate()
                        + " at "
                        + appointment.getAppointmentTime(),
                "PATIENT_CANCELLATION"
        );

        return savedAppointment;
    }

    // =========================================================
    // DOCTOR UPDATES APPOINTMENT STATUS
    // =========================================================

    public Appointment updateAppointmentStatus(
            Long appointmentId,
            AppointmentStatus status) {
Appointment appointment =
        getAppointmentById(appointmentId);

// Prevent completing an appointment before its scheduled date/time
if (status == AppointmentStatus.COMPLETED) {

    LocalDate today = LocalDate.now();
    LocalTime now = LocalTime.now();

    LocalDate appointmentDate = appointment.getAppointmentDate();
    LocalTime appointmentTime = appointment.getAppointmentTime();

    if (appointmentDate.isAfter(today) ||
            (appointmentDate.isEqual(today) &&
             appointmentTime.isAfter(now))) {

        throw new RuntimeException(
                "Appointment cannot be completed before its scheduled date and time"
        );
    }
}

appointment.setStatus(status);

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // -----------------------------------------------------
        // Doctor confirms appointment
        // -----------------------------------------------------

        if (status == AppointmentStatus.CONFIRMED) {

            notificationService.createNotification(
                    appointment.getPatient().getId(),
                   formatDoctorName(appointment.getDoctor().getUser().getName())
        + " has confirmed your appointment on "
                            + appointment.getAppointmentDate()
                            + " at "
                            + appointment.getAppointmentTime(),
                    "CONFIRMATION"
            );
        }

        // -----------------------------------------------------
        // Doctor cancels appointment
        // -----------------------------------------------------

        if (status == AppointmentStatus.CANCELLED) {

            notificationService.createNotification(
                    appointment.getPatient().getId(),
                    formatDoctorName(appointment.getDoctor().getUser().getName())
        + " has cancelled your appointment on "
                            + appointment.getAppointmentDate()
                            + " at "
                            + appointment.getAppointmentTime(),
                    "CANCELLATION"
            );
        }

        // -----------------------------------------------------
        // Doctor completes appointment
        // -----------------------------------------------------

        if (status == AppointmentStatus.COMPLETED) {

            notificationService.createNotification(
                    appointment.getPatient().getId(),
                    formatDoctorName(appointment.getDoctor().getUser().getName())
        + " has completed your appointment on "
                            + appointment.getAppointmentDate()
                            + " at "
                            + appointment.getAppointmentTime(),
                    "COMPLETION"
            );
        }

        return savedAppointment;
    }
}