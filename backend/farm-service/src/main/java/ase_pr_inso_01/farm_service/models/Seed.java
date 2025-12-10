package ase_pr_inso_01.farm_service.models;

import ase_pr_inso_01.farm_service.models.enums.SeedType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "seeds")
@Getter
@Setter
public class Seed {
    @Id
    private String Id;
    private SeedType seedType;
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
