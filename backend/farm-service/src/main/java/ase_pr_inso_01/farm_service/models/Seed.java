package ase_pr_inso_01.farm_service.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "seeds")
@Getter
@Setter
public class Seed {
    @Id
    private String id;
    private Float germinationRate;
    private Float recommendedPlantingDepth;
    private Float optimalTemp;
    private String recommendedPlantSeason;
}
