package ase_pr_inso_01.farm_service.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "farms")
@Getter
@Setter
public class Farm {
    @Id
    private String id;
    private String name;
    private String location;
    private SoilType soilType;
    private Field[] fields;
    private Recommendation[] recommendations;
}
