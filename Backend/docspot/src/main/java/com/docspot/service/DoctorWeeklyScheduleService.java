package com.docspot.service;

import com.docspot.entity.Doctor;
import com.docspot.entity.DoctorWeeklySchedule;
import com.docspot.repository.DoctorRepository;
import com.docspot.repository.DoctorWeeklyScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class DoctorWeeklyScheduleService {

    private final DoctorWeeklyScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    public DoctorWeeklyScheduleService(
            DoctorWeeklyScheduleRepository scheduleRepository,
            DoctorRepository doctorRepository) {

        this.scheduleRepository = scheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    // Add or update a doctor's schedule for a particular day
    public DoctorWeeklySchedule saveSchedule(
            Long doctorId,
            DayOfWeek dayOfWeek,
            LocalTime startTime,
            LocalTime endTime,
            boolean available) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        if (available && !startTime.isBefore(endTime)) {
            throw new RuntimeException(
                    "Start time must be before end time");
        }

        DoctorWeeklySchedule schedule =
                scheduleRepository
                        .findByDoctorAndDayOfWeek(
                                doctor,
                                dayOfWeek
                        )
                        .orElse(
                                new DoctorWeeklySchedule()
                        );

        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setAvailable(available);

        return scheduleRepository.save(schedule);
    }

    // Get the complete weekly schedule of a doctor
    public List<DoctorWeeklySchedule> getDoctorSchedule(
            Long doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        return scheduleRepository.findByDoctor(doctor);
    }

    // Get schedule for a particular day
    public DoctorWeeklySchedule getScheduleForDay(
            Long doctorId,
                    DayOfWeek dayOfWeek) {

            Doctor doctor = doctorRepository.findById(doctorId)
                            .orElseThrow(() -> new RuntimeException("Doctor not found"));

            return scheduleRepository
                            .findByDoctorAndDayOfWeek(
                                            doctor,
                                            dayOfWeek)
                            .orElse(null);
    }
    public DoctorWeeklySchedule getScheduleForDate(
        Long doctorId,
        LocalDate date) {

    DayOfWeek dayOfWeek = date.getDayOfWeek();

    return getScheduleForDay(doctorId, dayOfWeek);
}
}