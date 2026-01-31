package com.agriscope.notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Async
    public void sendAlertEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@agriscope.com");
            message.setTo(toEmail);
            message.setSubject("CRITICAL ALERT: " + subject);
            message.setText(body);
            emailSender.send(message);
            log.info("Alert email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send alert email. Error:{}", e.getMessage());
        }
    }

    @Async
    public void sendGenericEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@agriscope.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            emailSender.send(message);
            log.info("Generic email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send generic email. Error:{}", e.getMessage());
        }
    }
}