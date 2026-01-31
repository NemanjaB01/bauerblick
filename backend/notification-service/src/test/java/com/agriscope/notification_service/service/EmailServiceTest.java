package com.agriscope.notification_service.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender emailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    @DisplayName("Should send ALERT email with correct formatting")
    void sendAlertEmail_Success() {
        emailService.sendAlertEmail("test@test.com", "Flood Warning", "Water level high");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(emailSender).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertNotNull(sentMessage.getTo());
        assertEquals("test@test.com", sentMessage.getTo()[0]);
        assertEquals("CRITICAL ALERT: Flood Warning", sentMessage.getSubject());
        assertEquals("Water level high", sentMessage.getText());
        assertEquals("noreply@agriscope.com", sentMessage.getFrom());
    }

    @Test
    @DisplayName("Should send GENERIC email without subject prefix")
    void sendGenericEmail_Success() {
        emailService.sendResetEmail("user@test.com", "Welcome", "Hello User");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(emailSender).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertEquals("Welcome", sentMessage.getSubject());
        assertEquals("Hello User", sentMessage.getText());
    }

    @Test
    @DisplayName("Should handle exception gracefully when sending fails")
    void sendEmail_Exception_ShouldNotThrow() {
        doThrow(new RuntimeException("SMTP unavailable")).when(emailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() ->
                emailService.sendAlertEmail("fail@test.com", "Sub", "Body")
        );
    }
}