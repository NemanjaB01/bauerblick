package ase_pr_inso_01.farm_service.service;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmDetailsDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FieldUpdateDto;
import ase_pr_inso_01.farm_service.models.Farm;

import java.util.List;


public interface FarmService {
    Farm createFarm(FarmCreateDto dto, String email) throws Exception;

    Farm getFarmByName(String name);

    List<FarmDetailsDto> getFarmsByUserId(String userId);

    List<FarmDetailsDto> getFarmsByUserEmail(String email) throws Exception;

    void updateField(String farmId, FieldUpdateDto field);

    FarmDetailsDto getFarmById(String farmId, String email) throws Exception;

    void deleteFarm(String farmId, String email) throws Exception;
}
