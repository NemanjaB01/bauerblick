package ase_pr_inso_01.farm_service.controller.dto.farm;
import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.models.Recommendation;
import ase_pr_inso_01.farm_service.models.SoilType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FarmCreateDto {
    @NotBlank(message = "Name must not be empty")
    private String name;

    @NotBlank(message = "Location must not be empty")
    private String location;


    @NotBlank(message = "Soil type must not be empty")
    private SoilType soilType;

    private Field fields[];
    private Recommendation recommendations[];
}
