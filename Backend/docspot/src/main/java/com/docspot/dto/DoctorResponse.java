package com.docspot.dto;

import com.docspot.entity.Role;

public class DoctorResponse {

    private Long id;
    private Long userId;
    private String doctorName;
    private String email;
    private Role role;
    private String specialization;
    private String qualification;
    private Integer experience;
    private Double consultationFee;
    private String clinicName;
    private String clinicAddress;
    private String about;

    public DoctorResponse() {
    }

    public DoctorResponse(
            Long id,
            Long userId,
            String doctorName,
            String email,
            Role role,
            String specialization,
            String qualification,
            Integer experience,
            Double consultationFee,
            String clinicName,
            String clinicAddress,
            String about) {

        this.id = id;
        this.userId = userId;
        this.doctorName = doctorName;
        this.email = email;
        this.role = role;
        this.specialization = specialization;
        this.qualification = qualification;
        this.experience = experience;
        this.consultationFee = consultationFee;
        this.clinicName = clinicName;
        this.clinicAddress = clinicAddress;
        this.about = about;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getQualification() {
        return qualification;
    }

    public Integer getExperience() {
        return experience;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public String getClinicName() {
        return clinicName;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public String getAbout() {
        return about;
    }
}