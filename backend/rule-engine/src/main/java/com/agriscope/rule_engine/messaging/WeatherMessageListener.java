package com.agriscope.rule_engine.messaging;

import com.agriscope.rule_engine.config.RabbitMQConfig;
import com.agriscope.rule_engine.domain.dto.WeatherForecastDTO;
import com.agriscope.rule_engine.domain.dto.WeatherMessageDTO;
import com.agriscope.rule_engine.domain.enums.ForecastType;
import com.agriscope.rule_engine.domain.enums.SoilType;
import com.agriscope.rule_engine.domain.model.CurrentWeatherData;
import com.agriscope.rule_engine.domain.model.FarmDetails;
import com.agriscope.rule_engine.domain.model.HourlyWeatherData;
import com.agriscope.rule_engine.service.RuleEvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class WeatherMessageListener {

    @Autowired
    private RuleEvaluationService ruleEvaluationService;

    @RabbitListener(
            queues = RabbitMQConfig.WEATHER_QUEUE,
            concurrency = "1-4")
    public void handleMessage(WeatherMessageDTO message) {
        try {
            String userId = message.getUserId();
            String farmId = message.getFarmId();
            String type = message.getType();
            List<String> crops = message.getCrops();
            List<WeatherForecastDTO> forecast = message.getForecast();

            if (type == null || forecast == null || forecast.isEmpty()) {
                log.warn("Received invalid weather message for userId={}, farmId={}", userId, farmId);
                return;
            }

            processForecastByType(forecast, type, userId, farmId, crops);


        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
        }
    }


    private void processForecastByType(List<WeatherForecastDTO> forecastData,
                                       String forecastType,
                                       String userId,
                                       String farmId,
                                       List<String> crops) {
        switch (forecastType.toUpperCase()) {
            case "CURRENT":
                processCurrentForecast(forecastData, userId, farmId, crops);
                break;
            case "HOURLY":
                processHourlyForecast(forecastData, userId, farmId, crops);
                break;
            case "DAILY":
//                processDailyForecast(forecastData, userId, farmId);    // TODO
                break;
            default:
                log.warn("Unknown forecast type: {}", forecastType);
        }
    }

    private void processCurrentForecast(List<WeatherForecastDTO> forecastData,
                                        String userId,
                                        String farmId,
                                        List<String> crops) {
        if (forecastData.isEmpty()) {
            log.warn("Empty CURRENT forecast list for user {}, farm {}", userId, farmId);
            return;
        }

        WeatherForecastDTO dto = forecastData.getFirst();
        CurrentWeatherData weatherData = convertToCurrentWeatherData(dto, userId, farmId);
        weatherData.setForecastType(ForecastType.CURRENT);

        log.info("Current - user={}, farm={}, Temp: {}C, Rain: {}mm, Wind: {}m/s",
                userId,
                farmId,
                weatherData.getTemperature_2m(),
                weatherData.getRain(),
                weatherData.getWind_speed_10m());

        ruleEvaluationService.evaluateCurrentSafetyRules(weatherData, crops);
    }

    private void processHourlyForecast(List<WeatherForecastDTO> forecastData, String userId, String farmId, List<String> crops) {
        List<HourlyWeatherData> hourlyList = new ArrayList<>();

        for (WeatherForecastDTO dto : forecastData) {
            hourlyList.add(convertToHourlyWeatherData(dto, userId, farmId));
        }

        FarmDetails farm = new FarmDetails();
        farm.setFarmId(farmId);
        farm.setSoilType(SoilType.LOAM); // Default for now
        farm.setHasIrrigationSystem(true);

        log.info("Processing Daily Irrigation logic for {} hours of data", hourlyList.size());

        ruleEvaluationService.evaluateDailyIrrigation(hourlyList, farm, crops);
    }

    private HourlyWeatherData convertToHourlyWeatherData(WeatherForecastDTO dto, String userId, String farmId) {
        HourlyWeatherData data = new HourlyWeatherData();
        data.setUserId(userId);
        data.setFarmId(farmId);
        data.setForecastType(ForecastType.HOURLY);

        data.setTemperature_2m(dto.getTemperature2m());
        data.setRain(dto.getRain());
        data.setPrecipitation(dto.getPrecipitation());
        data.setPrecipitation_probability(dto.getPrecipitationProbability());
        data.setWind_speed_10m_max(dto.getWindSpeed10m());

        data.setSoil_moisture_0_to_1cm(dto.getSoilMoisture0to1cm());
        data.setSoil_moisture_1_to_3cm(dto.getSoilMoisture1to3cm());
        data.setSoil_moisture_3_to_9cm(dto.getSoilMoisture3to9cm());
        data.setSoil_moisture_9_to_27cm(dto.getSoilMoisture9to27cm());

        data.setEt0_fao_evapotranspiration(dto.getEt0FaoEvapotranspiration());

        if (dto.getTime() != null) {
            data.setDate(parseDateTime(dto.getTime()));
        }

        return data;
    }

    private CurrentWeatherData convertToCurrentWeatherData(WeatherForecastDTO dto,
                                                           String userId,
                                                           String farmId) {
        CurrentWeatherData weatherData = new CurrentWeatherData();
        weatherData.setUserId(userId);
        weatherData.setFarmId(farmId);

        weatherData.setTemperature_2m(dto.getTemperature2m());
        weatherData.setWind_speed_10m(dto.getWindSpeed10m());
        weatherData.setRain(dto.getRain());
        weatherData.setPrecipitation(dto.getPrecipitation());
        weatherData.setShowers(dto.getShowers());
        weatherData.setSnowfall(dto.getSnowfall());
        weatherData.setWeather_code(dto.getWeatherCode());

        if (dto.getTime() != null) {
            weatherData.setTime(parseDateTime(dto.getTime()));
        } else {
            weatherData.setTime(LocalDateTime.now());
        }

        return weatherData;
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            String normalized = dateTimeStr.replace(" ", "T");
            if (normalized.contains("+")) {
                normalized = normalized.substring(0, normalized.indexOf("+"));
            }
            return LocalDateTime.parse(normalized);
        } catch (Exception e) {
            log.warn("Failed to parse date: {}, using current time", dateTimeStr);
            return LocalDateTime.now();
        }
    }
}
