package ase_pr_inso_01.farm_service.service.impl;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.repository.FarmRepository;
import ase_pr_inso_01.farm_service.service.FarmService;
import org.springframework.stereotype.Service;


@Service
public class FarmServiceImpl implements FarmService {
    private final FarmRepository farmRepository;

    public FarmServiceImpl(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }

    @Override
    public Farm createFarm(FarmCreateDto dto) {
        if (farmRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Farm already registered");
        }
        Farm farm  = new Farm();
        farm.setName(dto.getName());
        farm.setLocation(dto.getLocation());
        farm.setLatitude(dto.getLatitude());
        farm.setLongitude(dto.getLongitude());
        farm.setSoilType(dto.getSoilType());
        farm.setFields(dto.getFields());
        farm.setRecommendations(dto.getRecommendations());

        return farmRepository.save(farm);
    }

    @Override
    public Farm getFarmByName(String name) {
        return null;
    }
}
