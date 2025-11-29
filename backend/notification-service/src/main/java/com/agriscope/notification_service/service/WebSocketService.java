package com.agriscope.notification_service.service;


import com.agriscope.notification_service.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendAlertToFarm(String farmId, Recommendation recommendation) {
        try {
            String destination = "/topic/alerts/" + farmId;
            messagingTemplate.convertAndSend(destination, recommendation);
            log.info("Sent WebSocket alert to farm: {}", farmId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket alert to farm: {}", farmId, e);
        }
    }

    public void sendWeatherToUser(String userId, Object payload) {
        try {
            String destination = "/topic/weather/" + userId;
            messagingTemplate.convertAndSend(destination, payload);
            log.info("Sent WebSocket weather to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket weather to user: {}", userId, e);
        }
    }
}