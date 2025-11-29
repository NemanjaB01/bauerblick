package ase_pr_inso_01.farm_service.service;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.models.Farm;

public interface FarmService {
    Farm createFarm (FarmCreateDto dto);

    Farm getFarmByName( String name);
}
