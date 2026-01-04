package ase_pr_inso_01.farm_service.controller.dto.farm;

import ase_pr_inso_01.farm_service.models.enums.SoilType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class FieldCreateDto {

    private Integer id;

    private String status;

    private String seedType;

    private Date plantedDate;

    private String growthStage;

    private Date harvestDate;
}