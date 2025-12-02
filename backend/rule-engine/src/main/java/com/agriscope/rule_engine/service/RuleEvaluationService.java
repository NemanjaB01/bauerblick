package com.agriscope.rule_engine.service;

import com.agriscope.rule_engine.domain.dto.DailyAnalysis;
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

    public void evaluateCurrentSafetyRules(CurrentWeatherData weatherData, List<String> crops) {
        log.info("Evaluating CURRENT rules for user {}, farm {}",
                weatherData.getUserId(), weatherData.getFarmId());

        KieSession kieSession = kieContainer.newKieSession();
        List<Recommendation> recommendations = new ArrayList<>();

        try {
            kieSession.setGlobal("recommendations", recommendations);
            kieSession.insert(weatherData);

            if (crops == null || crops.isEmpty()) {
                log.warn("No crops defined for farm {}, skipping seed insertion", weatherData.getFarmId());
            } else {
                for (String cropName : crops) {
                    try {
                        SeedType type = SeedType.valueOf(cropName.toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) {
                            kieSession.insert(seed);
                            log.debug("Inserted seed: {}", type);
                        }
                    } catch (IllegalArgumentException e) {
                        log.warn("Unknown crop type received: {}", cropName);
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

    public void evaluateDailyIrrigation(List<HourlyWeatherData> hourlyData, FarmDetails farm, List<String> crops) {
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

            if (crops != null) {
                for (String cropName : crops) {
                    try {
                        SeedType type = SeedType.valueOf(cropName.toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) kieSession.insert(seed);
                    } catch (Exception e) {
                        log.warn("Invalid crop name: {}", cropName);
                    }
                }
            }

            int firedRules = kieSession.fireAllRules();
            log.info("Fired {} CURRENT rules", firedRules);

            processHourlyRecommendations(recommendations, userId, farm.getFarmId(), avgTemperature);

        } finally {
            kieSession.dispose();
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
            rec.setFarmId(weatherData.getFarmId());
            rec.setWeatherTimestamp(weatherData.getTime());

            rec.getMetrics().put("temperature", weatherData.getTemperature_2m());

            log.info("Recommendation for user={}, farm={} : {} | Reason: {}",
                    rec.getUserId(), rec.getFarmId(), rec.getAdvice(), rec.getReasoning());

            recommendationProducer.sendRecommendation(rec);
        }
    }

    private void processHourlyRecommendations(List<Recommendation> recommendations, String userId, String farmId, double avgTemperature) {
        if (recommendations.isEmpty()) {
            log.info("No recommendations - conditions are normal");
            return;
        }


        LocalDateTime now = LocalDateTime.now();

        for (Recommendation rec : recommendations) {
            rec.setUserId(userId);
            rec.setFarmId(farmId);
            rec.setWeatherTimestamp(now);

            rec.getMetrics().put("temperature", avgTemperature);

            log.info("Sending Irrigation Alert: User={}, Advice={}", userId, rec.getAdvice());
            recommendationProducer.sendRecommendation(rec);
        }
    }

    public void evaluateDailyRules(DailyWeatherData weatherData) {
        // TODO
    }
}