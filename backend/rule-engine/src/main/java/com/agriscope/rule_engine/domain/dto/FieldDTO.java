package com.agriscope.rule_engine.domain.dto;

import lombok.Data;

@Data
public class FieldDTO {
    private String field_id;
    private String seed_type;
    private String growth_stage;
}