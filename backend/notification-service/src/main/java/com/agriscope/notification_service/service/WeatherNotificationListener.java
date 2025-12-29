package com.agriscope.notification_service.service;

import com.agriscope.notification_service.dto.WeatherUpdateDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;

import static com.agriscope.notification_service.config.RabbitMQConfig.NOTIFICATION_WEATHER_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeatherNotificationListener {

    private final WebSocketService webSocketService;


    @RabbitListener(queues = NOTIFICATION_WEATHER_QUEUE)
    public void handleWeather(WeatherUpdateDTO weatherData) {


        if (!"current".equalsIgnoreCase(weatherData.getType())) {
            return;
        }

        if (weatherData.getUserId() == null) {
            log.warn("Weather payload without user_id: {}", weatherData);
            return;
        }

        if (weatherData.getForecast() != null && !weatherData.getForecast().isEmpty()) {
            WeatherUpdateDTO.ForecastDTO currentForecast = weatherData.getForecast().getFirst();

            var simplifiedPayload = new LinkedHashMap<>();
            simplifiedPayload.put("user_id", weatherData.getUserId());
            simplifiedPayload.put("time", currentForecast.getTime());
            simplifiedPayload.put("farm_id", weatherData.getFarmId());
            simplifiedPayload.put("lat", weatherData.getLat());
            simplifiedPayload.put("lon", weatherData.getLon());
            simplifiedPayload.put("weather_code", currentForecast.getWeatherCode());
            simplifiedPayload.put("temp", currentForecast.getTemperature());

            webSocketService.sendWeatherToUser(weatherData.getFarmId(), simplifiedPayload);
        } else {
            log.warn("Received weather payload without forecast: {}", weatherData);
        }

        log.info("Sent weather update for user {}", weatherData.getUserId());
    }
}