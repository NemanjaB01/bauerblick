package ase_pr_inso_01.farm_service.controller.dto.farm;

import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.models.Recommendation;
import ase_pr_inso_01.farm_service.models.enums.SoilType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class FarmDetailsDto {
    private String id;
    private String name;
    private String location;
    private float latitude;
    private float longitude;
    private SoilType soilType;
    private Field fields[]; //TODO: Change to dto
    private Recommendation recommendations[]; //TODO: Change to dto
    private String userId;
}
