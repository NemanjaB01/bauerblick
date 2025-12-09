package ase_pr_inso_01.farm_service.controller.dto.farm;
import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.models.Recommendation;
import ase_pr_inso_01.farm_service.models.enums.SoilType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FarmCreateDto {
    @NotBlank(message = "Name must not be empty")
    private String name;

    // @NotBlank(message = "Location must not be empty")
    private String location;

    private float latitude;

    private float longitude;

    @NotNull(message = "Soil type must not be empty")
    private SoilType soilType;

    private Field fields[];
    private Recommendation recommendations[];
}



