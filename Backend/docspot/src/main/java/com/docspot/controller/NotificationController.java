package com.docspot.controller;

import com.docspot.dto.NotificationResponse;
import com.docspot.entity.Notification;
import com.docspot.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    private NotificationResponse convertToResponse(
            Notification notification) {

        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam String type) {

        Notification notification =
                notificationService.createNotification(
                        userId,
                        message,
                        type
                );

        return ResponseEntity.ok(
                convertToResponse(notification)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>>
            getUserNotifications(
                    @PathVariable Long userId) {

        List<NotificationResponse> notifications =
                notificationService
                        .getUserNotifications(userId)
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id) {

        Notification notification =
                notificationService.markAsRead(id);

        return ResponseEntity.ok(
                convertToResponse(notification)
        );
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> markAllAsRead(
            @PathVariable Long userId) {

        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(
                "All notifications marked as read"
        );
    }
}