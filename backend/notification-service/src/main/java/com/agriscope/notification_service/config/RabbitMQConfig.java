package com.agriscope.notification_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ALERT_QUEUE = "alert_queue";
    public static final String ALERT_EXCHANGE = "alert_exchange";
    public static final String ALERT_ROUTING_KEY = "alert.recommendation";

    public static final String WEATHER_EXCHANGE = "weather_exchange";
    public static final String NOTIFICATION_WEATHER_QUEUE = "weather_notification_queue";


    @Bean
    public Queue alertQueue() {
        return new Queue(ALERT_QUEUE, true);
    }

    @Bean
    public TopicExchange alertExchange() {
        return new TopicExchange(ALERT_EXCHANGE, true, false);
    }

    @Bean
    public Binding alertBinding(Queue alertQueue, TopicExchange alertExchange) {
        return BindingBuilder.bind(alertQueue).to(alertExchange).with(ALERT_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange weatherExchange() {
        return new TopicExchange(WEATHER_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationWeatherQueue() {
        return new Queue(NOTIFICATION_WEATHER_QUEUE, true);
    }

    @Bean
    public Binding notificationWeatherBinding(Queue notificationWeatherQueue,
                                              TopicExchange weatherExchange) {
        return BindingBuilder.bind(notificationWeatherQueue)
                .to(weatherExchange)
                .with("weather.current");
    }
}