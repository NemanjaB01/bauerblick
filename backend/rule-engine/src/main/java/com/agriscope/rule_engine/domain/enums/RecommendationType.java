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
    IRRIGATE_SOON,
    DELAY_IRRIGATION,

    CONTINUE_NORMAL,
    MONITOR_CONDITIONS
}