package ase_pr_inso_01.farm_service.service;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmsForUserDto;
import ase_pr_inso_01.farm_service.models.Farm;

import java.util.List;


public interface FarmService {
    Farm createFarm(FarmCreateDto dto) throws Exception;

    Farm getFarmByName(String name);

    List<FarmsForUserDto> getFarmsByUserId(String userId);
}
