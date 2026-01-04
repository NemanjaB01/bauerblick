package ase_pr_inso_01.farm_service.controller.dto.farm;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class FieldUpdateDto {
    private Integer id;
    private String status; // TODO: replace with enum FieldStatus if available
    private String seedType; // TODO: replace with enum SeedType if available
    private Date plantedDate;
    private String growthStage;
}
