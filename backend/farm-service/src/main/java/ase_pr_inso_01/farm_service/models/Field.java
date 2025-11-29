package ase_pr_inso_01.farm_service.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;


@Document(collection = "fields")
@Getter
@Setter
public class Field {
    @Id
    private String id;
    private Seed seed;
    private Integer seedsAmount;
    private Date datePlanted;
    private Date expectedHarvest;
    private String pesticideUsed;
    private Float area;



}
