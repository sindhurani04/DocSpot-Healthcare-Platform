package com.docspot.dto;

import com.docspot.entity.AppointmentStatus;

public class AppointmentStatusRequest {

    private AppointmentStatus status;

    public AppointmentStatusRequest() {
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}