package ase_pr_inso_01.farm_service.controller.dto.farm;

import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.models.Recommendation;
import ase_pr_inso_01.farm_service.models.enums.SoilType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FarmCreateDto {

    @NotBlank(message = "Name must not be empty")
    private String name;

    @NotNull(message = "Latitude must not be null")
    private Float latitude;

    @NotNull(message = "Longitude must not be null")
    private Float longitude;

    @NotNull(message = "Soil type must not be empty")
    private SoilType soilType;

    @NotNull(message = "Fields must not be null")
    private Field[] fields; //TODO: Change to dto
}