package ase_pr_inso_01.farm_service.service;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCheckDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmDetailsDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FieldDetailsDto;

import java.util.List;

//TODO: Add comments
public interface FarmService {
    FarmDetailsDto createFarm(FarmCreateDto dto, String email) throws Exception;

    FarmCheckDto checkUserHasFarms(String email) throws Exception;

    List<FarmDetailsDto> getFarmsByUserEmail(String email) throws Exception;

    FarmDetailsDto getFarmById(String farmId, String email) throws Exception;

    FarmDetailsDto updateField(String farmId, FieldDetailsDto fieldUpdate, String email) throws Exception;

    void deleteFarm(String farmId, String email) throws Exception;
}
