package com.docspot.dto;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;

    public AdminDashboardResponse(
            long totalUsers,
            long totalPatients,
            long totalDoctors,
            long totalAppointments) {

        this.totalUsers = totalUsers;
        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.totalAppointments = totalAppointments;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }
}