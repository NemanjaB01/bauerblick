package ase_pr_inso_01.user_service.service.impl;

import ase_pr_inso_01.user_service.config.RabbitMQConfig;
import ase_pr_inso_01.user_service.model.EmailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetProducer {

  private final RabbitTemplate rabbitTemplate;

  public void sendResetEmail(String userEmail, String token) {
    String frontendUrl = System.getenv("FRONTEND_URL");
    if (frontendUrl == null) {
      frontendUrl = "http://localhost:4200";
    }
    String resetLink = frontendUrl + "/reset-password?token=" + token;

    EmailRequest request = new EmailRequest(
            userEmail,
            "Password Reset Request",
            "To reset your password, please click the following link: " + resetLink
    );

    rabbitTemplate.convertAndSend(
            RabbitMQConfig.EMAIL_EXCHANGE,
            RabbitMQConfig.EMAIL_ROUTING_KEY,
            request
    );
  }
}