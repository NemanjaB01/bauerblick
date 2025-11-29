package com.agriscope.rule_engine.domain.model;

import com.agriscope.rule_engine.domain.enums.SeedType;
import lombok.Data;

@Data
public class Seed {
    private SeedType seedType;
    private String displayName;
    private String scientificName;

    private Double minTemperature;
    private Double optimalTemperature;
    private Double maxTemperature;

    private Double minSoilMoisture;
    private Double optimalSoilMoisture;
    private Double maxSoilMoisture;

    private Double waterRequirement;

    private Double frostRiskTemperature;
    private Double heatStressTemperature;
    private Double heavyRainThreshold;

}