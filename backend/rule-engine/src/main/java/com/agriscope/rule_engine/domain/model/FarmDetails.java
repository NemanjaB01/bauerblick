package com.agriscope.rule_engine.domain.model;

import com.agriscope.rule_engine.domain.enums.SoilType;
import lombok.Data;

@Data
public class FarmDetails {
    private String farmId;
    private SoilType soilType;
    private boolean hasIrrigationSystem;
}