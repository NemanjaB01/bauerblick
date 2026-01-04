package com.agriscope.rule_engine.service;

import com.agriscope.rule_engine.domain.dto.DailyAnalysis;
import com.agriscope.rule_engine.domain.dto.FieldDTO;
import com.agriscope.rule_engine.domain.enums.GrowthStage;
import com.agriscope.rule_engine.domain.enums.SeedType;
import com.agriscope.rule_engine.domain.model.*;
import com.agriscope.rule_engine.messaging.RecommendationProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;

@Slf4j
@Service
@RequiredArgsConstructor
public class RuleEvaluationService {

    @Autowired
    private KieContainer kieContainer;

    @Autowired
    private SeedService seedService;

    @Autowired
    private RecommendationProducer recommendationProducer;

    public void evaluateCurrentDataForFarm(CurrentWeatherData weatherData, List<FieldDTO> fields) {
        log.info("Evaluating CURRENT rules for user {}, farm {}",
                weatherData.getUserId(), weatherData.getFarmId());

        KieSession kieSession = kieContainer.newKieSession();
        List<Recommendation> recommendations = new ArrayList<>();

        try {
            kieSession.setGlobal("recommendations", recommendations);
            kieSession.insert(weatherData);

            if (fields == null || fields.isEmpty()) {
                log.warn("No seeds defined for farm {}, skipping seed insertion", weatherData.getFarmId());
            } else {
                for (FieldDTO field : fields) {
                    try {
                        SeedType type = SeedType.valueOf(field.getSeed_type().toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) {
                            kieSession.insert(seed);
                            log.debug("Inserted seed: {}", type);
                        }
                    } catch (IllegalArgumentException e) {
                        log.warn("Unknown seed type received: {}", field.getSeed_type());
                    }
                }
            }

            int firedRules = kieSession.fireAllRules();
            log.info("Fired {} CURRENT rules", firedRules);

            processCurrentRecommendations(recommendations, weatherData);

        } finally {
            kieSession.dispose();
        }
    }

    public void evaluateHourlDataForFarm(List<HourlyWeatherData> hourlyData, FarmDetails farm, List<FieldDTO> fields) {
        if (hourlyData == null || hourlyData.isEmpty()) return;

        double sumEt0 = hourlyData.stream()
                .mapToDouble(d -> d.getEt0_fao_evapotranspiration() != null ? d.getEt0_fao_evapotranspiration() : 0.0)
                .sum();

        double sumRain = hourlyData.stream()
                .mapToDouble(d -> d.getPrecipitation() != null ? d.getPrecipitation() : 0.0)
                .sum();

        OptionalDouble avgTemperatureOpt = hourlyData.stream()
                .mapToDouble(d -> d.getTemperature_2m() != null ? d.getTemperature_2m() : 0.0)
                .average();
        double avgTemperature = avgTemperatureOpt.orElse(0.0);

        double currentMoisture = hourlyData.getFirst().getSoil_moisture_3_to_9cm();
        String userId = hourlyData.getFirst().getUserId();
        String email = hourlyData.getFirst().getEmail();

        DailyAnalysis analysis = DailyAnalysis.builder()
                .totalEt0(sumEt0)
                .totalRain(sumRain)
                .currentSoilMoisture(currentMoisture)
                .build();

        KieSession kieSession = kieContainer.newKieSession();
        List<Recommendation> recommendations = new ArrayList<>();

        try {
            kieSession.setGlobal("recommendations", recommendations);
            kieSession.insert(farm);
            kieSession.insert(analysis);

            int safetyCheckLimit = Math.min(hourlyData.size(), 3);

            for (int i = 0; i < safetyCheckLimit; i++) {
                kieSession.insert(hourlyData.get(i));
            }
            log.info("Inserted {} hours of forecast for General Safety evaluation.", safetyCheckLimit);
            if (fields != null) {
                for (FieldDTO field : fields) {
                    try {
                        SeedType type = SeedType.valueOf(field.getSeed_type().toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) {
                            kieSession.insert(seed);
                        }
                        GrowthStage stage = mapGrowthStage(field.getGrowth_stage());
                        kieSession.insert(new FieldStatus(field.getField_id(), type, stage));

                        log.debug("Inserted field: {} with seed {} at stage {}", field.getField_id(), type, stage);
                    } catch (Exception e) {
                        log.warn("Error processing field {}: {}", field.getField_id(), e.getMessage());                    }
                }
            }

            int firedRules = kieSession.fireAllRules();
            log.info("Fired {} HOURLY rules", firedRules);

            processHourlyRecommendations(recommendations, userId, email, farm.getFarmId(), avgTemperature);

        } finally {
            kieSession.dispose();
        }

    }

    private GrowthStage mapGrowthStage(String stageRaw) {
        if (stageRaw == null) return GrowthStage.YOUNG;

        switch (stageRaw) {
            case "0": return GrowthStage.SEEDLING;
            case "1": return GrowthStage.YOUNG;
            case "2": return GrowthStage.MATURE;
            case "3": return GrowthStage.READY;
            default:  return GrowthStage.MATURE;
        }
    }

    private void processCurrentRecommendations(List<Recommendation> recommendations,
                                               CurrentWeatherData weatherData) {
        if (recommendations.isEmpty()) {
            log.info("No recommendations - conditions are normal");
            return;
        }

        for (Recommendation rec : recommendations) {
            rec.setUserId(weatherData.getUserId());
            rec.setEmail(weatherData.getEmail());
            rec.setFarmId(weatherData.getFarmId());
            rec.setWeatherTimestamp(weatherData.getTime());

            rec.getMetrics().put("temperature", weatherData.getTemperature_2m());

            log.info("Recommendation for user={}, farm={} : {} | Reason: {}",
                    rec.getUserId(), rec.getFarmId(), rec.getAdvice(), rec.getReasoning());

            recommendationProducer.sendRecommendation(rec);
        }
    }

    private void processHourlyRecommendations(List<Recommendation> recommendations, String userId, String email, String farmId, double avgTemperature) {
        if (recommendations.isEmpty()) {
            log.info("No recommendations - conditions are normal");
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        for (Recommendation rec : recommendations) {
            rec.setUserId(userId);
            rec.setEmail(email);
            rec.setFarmId(farmId);
            rec.setWeatherTimestamp(now);

            rec.getMetrics().put("temperature", avgTemperature);

            log.info("Sending Recommendation: User={}, Advice={}", userId, rec.getAdvice());
            recommendationProducer.sendRecommendation(rec);
        }
    }

    public void evaluateDailyRules(List<DailyWeatherData> dailyList, List<FieldDTO> fields) {
        if (dailyList == null || dailyList.isEmpty()) return;

        KieSession kieSession = kieContainer.newKieSession();
        List<Recommendation> recommendations = new ArrayList<>();

        try {
            kieSession.setGlobal("recommendations", recommendations);

            for (DailyWeatherData day : dailyList) {
                kieSession.insert(day);
            }

            if (fields != null) {
                for (FieldDTO field : fields) {
                    try {
                        SeedType type = SeedType.valueOf(field.getSeed_type().toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) kieSession.insert(seed);
                        GrowthStage stage = mapGrowthStage(field.getGrowth_stage());
                        kieSession.insert(new FieldStatus(field.getField_id(), type, stage));
                    } catch (Exception e) {
                        log.warn("Invalid seed: {}", field.getSeed_type());
                    }
                }
            }

            int firedRules = kieSession.fireAllRules();
            log.info("Fired {} DAILY rules", firedRules);
            processDailyRecommendations(recommendations, dailyList.getFirst());

        } finally {
            kieSession.dispose();
        }
    }

    private void processDailyRecommendations(List<Recommendation> recs, DailyWeatherData metaData) {
        for (Recommendation rec : recs) {
            rec.setUserId(metaData.getUserId());
            rec.setEmail(metaData.getEmail());
            rec.setFarmId(metaData.getFarmId());
            rec.setWeatherTimestamp(LocalDateTime.now());
            log.info("Sending Daily Recommendation for target date: {}", rec.getMetrics().get("forecast_date"));
            recommendationProducer.sendRecommendation(rec);
        }
    }
}