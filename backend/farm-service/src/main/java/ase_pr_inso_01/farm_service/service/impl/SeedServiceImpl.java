package ase_pr_inso_01.farm_service.service.impl;

import ase_pr_inso_01.farm_service.controller.dto.farm.SeedDto;
import ase_pr_inso_01.farm_service.models.Seed;
import ase_pr_inso_01.farm_service.models.enums.SeedType;
import ase_pr_inso_01.farm_service.repository.SeedRepository;
import ase_pr_inso_01.farm_service.service.SeedService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class SeedServiceImpl implements SeedService {

    private final SeedRepository seedRepository;

    public SeedServiceImpl(SeedRepository seedRepository) {
        this.seedRepository = seedRepository;
    }

    @Override
    public List<SeedDto> getAllSeeds() {
        return seedRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public Seed getSeedByName(String name) {
        return null;
    }

    @Override
    public SeedDto getByDisplayName(String displayName) {
        SeedType type = Arrays.stream(SeedType.values())
                .filter(t -> t.getDisplayName().equalsIgnoreCase(displayName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No SeedType with displayName: " + displayName));

        Optional<Seed> seedOpt = seedRepository.findBySeedType(type);

        if (seedOpt.isEmpty()) {
            throw new RuntimeException("No Seed found for SeedType: " + displayName);
        }

        return mapToDto(seedOpt.get());
    }

    private SeedDto mapToDto(Seed seed) {
        SeedDto dto = new SeedDto();

        dto.setId(seed.getId());
        dto.setSeedType(seed.getSeedType());

        if (seed.getDisplayName() != null) {
            dto.setDisplayName(seed.getDisplayName());
        } else if (seed.getSeedType() != null) {
            dto.setDisplayName(seed.getSeedType().getDisplayName());
        }

        dto.setScientificName(seed.getScientificName());

        dto.setMinTemperature(seed.getMinTemperature());
        dto.setMaxTemperature(seed.getMaxTemperature());
        dto.setHeatStressTemperature(seed.getHeatStressTemperature());

        dto.setWaterRequirement(seed.getWaterRequirement());
        dto.setHeavyRainThreshold(seed.getHeavyRainThreshold());
        dto.setMinSoilMoisture(seed.getMinSoilMoisture());
        dto.setAllowedWaterDeficit(seed.getAllowedWaterDeficit());

        dto.setSeedCoefficient(seed.getSeedCoefficient());

        return dto;
    }
}