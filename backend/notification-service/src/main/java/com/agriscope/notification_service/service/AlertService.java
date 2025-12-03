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

    private static final double DEFICIT_CHANGE_THRESHOLD = 2.0;

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
            log.info("Significant change detected, sending update for {}.", newRec.getRecommendationType());
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
        String type = newRec.getRecommendationType();

        if (type.equals("MONITOR_CONDITIONS") || type.equals("CONTINUE_NORMAL")) {
            return false;
        }

        double oldValue = getRelevantMetricValue(oldRec, type);
        double newValue = getRelevantMetricValue(newRec, type);

        double diff = Math.abs(newValue - oldValue);

        if (type.equals("FROST_ALERT") || type.equals("HEAT_ALERT")) {
            return diff >= TEMP_CHANGE_THRESHOLD;
        }

        if (type.equals("IRRIGATE_NOW")) {
            return diff >= DEFICIT_CHANGE_THRESHOLD;
        }

        return true;
    }

    private double getRelevantMetricValue(Recommendation rec, String type) {
        if (rec.getMetrics() == null) return 0.0;

        if (type.equals("FROST_ALERT") || type.equals("HEAT_ALERT")) {
            return getMetricValue(rec, "temperature");
        }

        if (type.equals("IRRIGATE_NOW")) {
            return getMetricValue(rec, "deficit_amount");
        }

        return 0.0;
    }

    private double getMetricValue(Recommendation rec, String key) {
        if (rec.getMetrics().containsKey(key)) {
            Object obj = rec.getMetrics().get(key);
            if (obj instanceof Number) {
                return ((Number) obj).doubleValue();
            }
        }
        return 0.0;
    }



}