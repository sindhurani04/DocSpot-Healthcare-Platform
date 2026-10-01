package com.docspot.repository;

import com.docspot.entity.DoctorWeeklySchedule;
import com.docspot.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface DoctorWeeklyScheduleRepository
        extends JpaRepository<DoctorWeeklySchedule, Long> {

    List<DoctorWeeklySchedule> findByDoctor(Doctor doctor);

    Optional<DoctorWeeklySchedule> findByDoctorAndDayOfWeek(
            Doctor doctor,
            DayOfWeek dayOfWeek
    );
}