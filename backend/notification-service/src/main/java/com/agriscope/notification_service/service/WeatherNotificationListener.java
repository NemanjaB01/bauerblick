package com.agriscope.notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

import static com.agriscope.notification_service.config.RabbitMQConfig.NOTIFICATION_WEATHER_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeatherNotificationListener {

    private final WebSocketService webSocketService;


    @RabbitListener(queues = NOTIFICATION_WEATHER_QUEUE)
    public void handleWeather(Map<String, Object> data) {
        Object typeObj = data.get("type");
        String type = typeObj != null ? typeObj.toString() : null;
        if (!"current".equalsIgnoreCase(type)) {
            return;
        }

        Object userIdObj = data.get("user_id");
        if (userIdObj == null) {
            log.warn("Weather payload without user_id, cannot route to websocket: {}", data);
            return;
        }

        String userId = String.valueOf(userIdObj);
        webSocketService.sendWeatherToUser(userId, data);
    }
}