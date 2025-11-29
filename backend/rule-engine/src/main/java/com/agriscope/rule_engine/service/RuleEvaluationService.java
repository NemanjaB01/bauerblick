package com.agriscope.rule_engine.service;

import com.agriscope.rule_engine.domain.enums.SeedType;
import com.agriscope.rule_engine.domain.model.*;
import com.agriscope.rule_engine.messaging.RecommendationProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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

    public void evaluateCurrentRules(CurrentWeatherData weatherData, List<String> crops) {
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

            processRecommendations(recommendations, weatherData);

        } finally {
            kieSession.dispose();
        }
    }

    private void processRecommendations(List<Recommendation> recommendations,
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
            rec.getMetrics().put("rain", weatherData.getRain());
            rec.getMetrics().put("wind_speed", weatherData.getWind_speed_10m());

            log.info("Recommendation for user={}, farm={} : {} | Reason: {}",
                    rec.getUserId(), rec.getFarmId(), rec.getAdvice(), rec.getReasoning());

            recommendationProducer.sendRecommendation(rec);
        }
    }

    public void evaluateHourlyRules(HourlyWeatherData weatherData) {
        // TODO
    }

    public void evaluateDailyRules(DailyWeatherData weatherData) {
        // TODO
    }
}