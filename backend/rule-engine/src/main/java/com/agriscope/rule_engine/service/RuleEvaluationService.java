package com.agriscope.rule_engine.service;

import com.agriscope.rule_engine.domain.dto.DailyAnalysis;
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

    public void evaluateCurrentDataForFarm(CurrentWeatherData weatherData, List<String>  seeds) {
        log.info("Evaluating CURRENT rules for user {}, farm {}",
                weatherData.getUserId(), weatherData.getFarmId());

        KieSession kieSession = kieContainer.newKieSession();
        List<Recommendation> recommendations = new ArrayList<>();

        try {
            kieSession.setGlobal("recommendations", recommendations);
            kieSession.insert(weatherData);

            if (seeds == null || seeds.isEmpty()) {
                log.warn("No seeds defined for farm {}, skipping seed insertion", weatherData.getFarmId());
            } else {
                for (String seedName : seeds) {
                    try {
                        SeedType type = SeedType.valueOf(seedName.toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) {
                            kieSession.insert(seed);
                            log.debug("Inserted seed: {}", type);
                        }
                    } catch (IllegalArgumentException e) {
                        log.warn("Unknown seed type received: {}", seedName);
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

    public void evaluateHourlDataForFarm(List<HourlyWeatherData> hourlyData, FarmDetails farm, List<String> seeds) {
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
            if (seeds != null) {
                for (String seedName : seeds) {
                    try {
                        SeedType type = SeedType.valueOf(seedName.toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) {
                            kieSession.insert(new FieldStatus(type, GrowthStage.MATURE));   // default mature
                        }
                    } catch (Exception e) {
                        log.warn("Invalid seed name: {}", seedName);
                    }
                }
            }

            int firedRules = kieSession.fireAllRules();
            log.info("Fired {} CURRENT rules", firedRules);

            processHourlyRecommendations(recommendations, userId, email, farm.getFarmId(), avgTemperature);

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

    public void evaluateDailyRules(List<DailyWeatherData> dailyList, List<String> seeds) {
        if (dailyList == null || dailyList.isEmpty()) return;

        KieSession kieSession = kieContainer.newKieSession();
        List<Recommendation> recommendations = new ArrayList<>();

        try {
            kieSession.setGlobal("recommendations", recommendations);

            for (DailyWeatherData day : dailyList) {
                kieSession.insert(day);
            }

            if (seeds != null) {
                for (String seedName : seeds) {
                    try {
                        SeedType type = SeedType.valueOf(seedName.toUpperCase());
                        Seed seed = seedService.getSeed(type);
                        if (seed != null) kieSession.insert(seed);
                    } catch (Exception e) {
                        log.warn("Invalid seed: {}", seedName);
                    }
                }
            }

            int firedRules = kieSession.fireAllRules();
            log.info("Fired {} DAILY rules", firedRules);
            processDailyRecommendations(recommendations, dailyList.get(0));

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