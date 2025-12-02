package com.agriscope.notification_service.service;

import com.agriscope.notification_service.model.Recommendation;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final WebSocketService webSocketService;

    private final Cache<String, Recommendation> lastSentCache = Caffeine.newBuilder()
            .expireAfterWrite(24, TimeUnit.HOURS)
            .maximumSize(10000)
            .build();

    private static final double TEMP_CHANGE_THRESHOLD = 2.0;

    public void processIncomingAlert(Recommendation newRec) {
        String farmId = newRec.getFarmId();
        if (farmId == null) {
            log.warn("Received recommendation without farmId");
            return;
        }

        String uniqueKey = String.format("%s_%s_%s",
                farmId,
                newRec.getRecommendationType(),
                newRec.getRecommendedSeed());

        Recommendation lastRec = lastSentCache.getIfPresent(uniqueKey);

        if (lastRec == null) {
            sendAndCacheAlert(uniqueKey, newRec);
            return;
        }

        if (isSignificantChange(lastRec, newRec)) {
            log.info("Significant temp change detected, sending update.");
            sendAndCacheAlert(uniqueKey, newRec);
        } else {
            log.info("Duplicate alert suppressed (insignificant change).");
        }
    }

    private void sendAndCacheAlert(String key, Recommendation rec) {
        webSocketService.sendAlertToFarm(rec.getFarmId(), rec);

        lastSentCache.put(key, rec);

        log.info("Processed alert for farm: {}", rec.getFarmId());
    }

    private boolean isSignificantChange(Recommendation oldRec, Recommendation newRec) {
        double oldTemp = getTempFromMetrics(oldRec);
        double newTemp = getTempFromMetrics(newRec);

        double diff = Math.abs(newTemp - oldTemp);

        return diff >= TEMP_CHANGE_THRESHOLD;
    }

    private double getTempFromMetrics(Recommendation rec) {
        if (rec.getMetrics() != null && rec.getMetrics().containsKey("temperature")) {
            Object tempObj = rec.getMetrics().get("temperature");
            if (tempObj instanceof Number) {
                return ((Number) tempObj).doubleValue();
            }
        }
        return 0.0;
    }



}