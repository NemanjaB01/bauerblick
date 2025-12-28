package com.agriscope.rule_engine.domain.model;

import com.agriscope.rule_engine.domain.enums.SeedType;
import com.agriscope.rule_engine.domain.enums.GrowthStage;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FieldStatus {
    private SeedType seedType;
    private GrowthStage stage;
}