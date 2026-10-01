package com.docspot.controller;

import com.docspot.dto.WeeklyScheduleResponse;
import com.docspot.entity.DoctorWeeklySchedule;
import com.docspot.service.DoctorWeeklyScheduleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/weekly-schedule")
public class DoctorWeeklyScheduleController {

    private final DoctorWeeklyScheduleService scheduleService;

    public DoctorWeeklyScheduleController(
            DoctorWeeklyScheduleService scheduleService) {

        this.scheduleService = scheduleService;
    }

    // Convert entity to safe response DTO
    private WeeklyScheduleResponse convertToResponse(
            DoctorWeeklySchedule schedule) {

        return new WeeklyScheduleResponse(
                schedule.getId(),
                schedule.getDoctor().getId(),
                schedule.getDoctor().getUser().getName(),
                schedule.getDayOfWeek(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.isAvailable()
        );
    }

    // Add or update schedule for one day
    @PostMapping
    public ResponseEntity<WeeklyScheduleResponse> saveSchedule(
            @RequestParam Long doctorId,
            @RequestParam DayOfWeek dayOfWeek,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime,
            @RequestParam boolean available) {

        DoctorWeeklySchedule schedule =
                scheduleService.saveSchedule(
                        doctorId,
                        dayOfWeek,
                        startTime,
                        endTime,
                        available
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(schedule));
    }

    // Get complete weekly schedule
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<WeeklyScheduleResponse>> getDoctorSchedule(
            @PathVariable Long doctorId) {

        List<WeeklyScheduleResponse> response =
                scheduleService.getDoctorSchedule(doctorId)
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    // Get schedule for a particular weekday
    @GetMapping("/doctor/{doctorId}/day")
    public ResponseEntity<WeeklyScheduleResponse> getScheduleForDay(
            @PathVariable Long doctorId,
            @RequestParam DayOfWeek dayOfWeek) {

        DoctorWeeklySchedule schedule =
                scheduleService.getScheduleForDay(
                        doctorId,
                        dayOfWeek
                );

        if (schedule == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                convertToResponse(schedule)
        );
    }

    // Get schedule based on an actual calendar date
    @GetMapping("/doctor/{doctorId}/date")
    public ResponseEntity<WeeklyScheduleResponse> getScheduleForDate(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date) {

        DoctorWeeklySchedule schedule =
                scheduleService.getScheduleForDate(
                        doctorId,
                        date
                );

        if (schedule == null || !schedule.isAvailable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                convertToResponse(schedule)
        );
    }

    // Save multiple available days at once
    @PostMapping("/bulk")
    public ResponseEntity<List<WeeklyScheduleResponse>> saveBulkSchedule(
            @RequestParam Long doctorId,
            @RequestParam String availableDays,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime) {

        List<DoctorWeeklySchedule> schedules =
                new ArrayList<>();

        String[] days = availableDays.split(",");

        for (String day : days) {

            DayOfWeek dayOfWeek =
                    DayOfWeek.valueOf(
                            day.trim().toUpperCase()
                    );

            DoctorWeeklySchedule schedule =
                    scheduleService.saveSchedule(
                            doctorId,
                            dayOfWeek,
                            startTime,
                            endTime,
                            true
                    );

            schedules.add(schedule);
        }

        List<WeeklyScheduleResponse> response =
                schedules.stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}