package com.agriscope.notification_service.service;

import com.agriscope.notification_service.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final WebSocketService webSocketService;

    public void processIncomingAlert(Recommendation recommendation) {
//        saveAlert(recommendation);

        String farmId = recommendation.getFarmId();
        if (farmId == null) {
            log.warn("Received recommendation without farmId, cannot route to farm-specific topic. id={}", recommendation.getId());
            return;
        }
        webSocketService.sendAlertToFarm(recommendation.getFarmId(), recommendation);

        log.info("Processed alert for user: {}", recommendation.getFarmId());
    }

    private void saveAlert(Recommendation recommendation) {
        // save to db
    }

}