package com.agriscope.rule_engine.domain.enums;

public enum RecommendationType {
    FROST_ALERT,
    HEAT_ALERT,
    RAIN_ALERT,
    DROUGHT_ALERT,
    DISEASE_RISK_ALERT,

    SAFETY_ALERT,
    DELAY_OPERATIONS,

    PLANT_NOW,
    DELAY_PLANTING,

    IRRIGATE_NOW,
    DELAY_IRRIGATION,
    REDUCE_IRRIGATION,

    CONTINUE_NORMAL,
    MONITOR_CONDITIONS
}