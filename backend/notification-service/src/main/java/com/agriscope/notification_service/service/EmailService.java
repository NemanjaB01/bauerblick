package com.agriscope.notification_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Async
    public void sendAlertEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@agriscope.com");
            helper.setTo(toEmail);
            helper.setSubject("FARM ALERT: " + formatSubject(subject));
            helper.setText(htmlBody, true);

            emailSender.send(message);
            log.info("HTML alert email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send alert email. Error: {}", e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@agriscope.com");
            helper.setTo(to);
            helper.setSubject("Welcome to Agriscope, " + firstName + "!");

            String htmlBody = "<h1>Welcome aboard!</h1>" +
                    "<p>Hi " + firstName + ",</p>" +
                    "<p>Thank you for joining Agriscope. Your account has been successfully created.</p>" +
                    "<p>Start monitoring your farm today!</p>" +
                    "<br><p>Best regards,<br>The Agriscope Team</p>";

            helper.setText(htmlBody, true);

            emailSender.send(message);
            log.info("Welcome email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}. Error: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendResetEmail(String to, String subject, String body) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@agriscope.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            emailSender.send(message);
            log.info("Generic email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send generic email. Error: {}", e.getMessage());
        }
    }

    private String formatSubject(String subject) {
        if (subject == null || subject.trim().isEmpty()) {
            return "Alert";
        }

        String[] words = subject.replace("_", " ").toLowerCase().split(" ");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1))
                        .append(" ");
            }
        }
        return result.toString().trim();
    }
}