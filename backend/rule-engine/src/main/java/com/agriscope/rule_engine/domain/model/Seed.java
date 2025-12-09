package com.agriscope.rule_engine.domain.model;

import com.agriscope.rule_engine.domain.enums.SeedType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Seed {
    private SeedType seedType;
    private String displayName;
    private String scientificName;

    private Double minTemperature;
    private Double maxTemperature;

    private Double minSoilMoisture;
    private Double waterRequirement;

    private Double frostRiskTemperature;
    private Double heatStressTemperature;
    private Double heavyRainThreshold;
    private Double seedCoefficient;
    private Double allowedWaterDeficit;
}