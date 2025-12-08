package com.agriscope.notification_service.service;

import com.agriscope.notification_service.config.RabbitMQConfig;
import com.agriscope.notification_service.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.ALERT_QUEUE)
    public void handleRecommendation(Recommendation recommendation) {
        log.info("Received recommendation id={}, farmId={}, type={}",
                recommendation.getId(),
                recommendation.getFarmId(),
                recommendation.getRecommendationType());

        try {
            notificationService.processIncomingRecommendation(recommendation);
        } catch (Exception e) {
            log.error("Failed to process recommendation type {}. Data: {}",
                    recommendation.getRecommendationType(), recommendation, e);
        }
    }
}