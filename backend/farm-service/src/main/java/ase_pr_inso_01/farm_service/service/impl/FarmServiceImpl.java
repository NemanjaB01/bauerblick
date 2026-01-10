package ase_pr_inso_01.farm_service.service.impl;

import ase_pr_inso_01.farm_service.controller.dto.farm.*;
import ase_pr_inso_01.farm_service.mapper.FarmMapper;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.repository.FarmRepository;
import ase_pr_inso_01.farm_service.service.FarmService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final FarmMapper farmMapper;
    private final RestTemplate restTemplate;

    public FarmServiceImpl(FarmRepository farmRepository, FarmMapper farmMapper, RestTemplate restTemplate) {
        this.farmRepository = farmRepository;
        this.farmMapper = farmMapper;
        this.restTemplate = restTemplate;
    }

    @Override
    public FarmDetailsDto createFarm(FarmCreateDto farm, String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);

        if (farmRepository.existsByNameAndUserId(farm.name(), user.getId())) {
            throw new RuntimeException("You already have a farm with this name");
        }

        Farm createdFarm = farmMapper.farmCreateDtoToFarm(farm, user.getId());
        farmRepository.save(createdFarm);

        return farmMapper.farmToFarmDetailsDto(createdFarm);
    }

    /**
     * ⭐ Check if user has any farms
     */
    @Override
    public FarmCheckDto checkUserHasFarms(String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);
        List<Farm> farms = farmRepository.findByUserId(user.getId());

        return new FarmCheckDto(
                !farms.isEmpty(),  // hasFarms
                farms.size()       // farmCount
        );
    }

    @Override
    public List<FarmDetailsDto> getFarmsByUserEmail(String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);
        return this.getFarmsByUserId(user.getId());
    }

    @Override
    public FarmDetailsDto updateField(String farmId, FieldDetailsDto fieldUpdate, String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);

        // Fetch the farm by ID
        Optional<Farm> optionalFarm = farmRepository.findById(farmId);

        if (optionalFarm.isEmpty()) {
            throw new RuntimeException("Farm not found with ID: " + farmId);
        }

        Farm farm = optionalFarm.get();

        // ⭐ SECURITY: Check if farm belongs to user
        if (!farm.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: This farm does not belong to you");
        }

        Field[] fields = farm.getFields();

        // Find the field to update
        Field fieldToUpdate = Arrays.stream(fields)
                .filter(f -> f.getId().equals(fieldUpdate.id()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Field not found with ID: " + fieldUpdate.id()));

        // Update the found field
        fieldToUpdate.setStatus(fieldUpdate.status());
        fieldToUpdate.setSeedType(fieldUpdate.seedType());
        fieldToUpdate.setPlantedDate(fieldUpdate.plantedDate());
        fieldToUpdate.setGrowthStage(fieldUpdate.growthStage());

        // Save the changes
        Farm updatedFarm = farmRepository.save(farm);
        return farmMapper.farmToFarmDetailsDto(updatedFarm);
    }

    @Override
    public FarmDetailsDto getFarmById(String farmId, String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);

        Optional<Farm> optionalFarm = farmRepository.findById(farmId);

        if (optionalFarm.isEmpty()) {
            throw new RuntimeException("Farm not found with ID: " + farmId);
        }

        Farm farm = optionalFarm.get();

        // Check if farm belongs to user
        if (!farm.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: This farm does not belong to you");
        }

        return farmMapper.farmToFarmDetailsDto(farm);
    }

    @Override
    public void deleteFarm(String farmId, String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);

        Optional<Farm> optionalFarm = farmRepository.findById(farmId);

        if (optionalFarm.isEmpty()) {
            throw new RuntimeException("Farm not found with ID: " + farmId);
        }

        Farm farm = optionalFarm.get();

        // Check if farm belongs to user
        if (!farm.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: This farm does not belong to you");
        }

        farmRepository.delete(farm);
    }

    private UserDetailsDto getUserDetails(String email) throws Exception {
        String url = "http://api-gateway:8080/api/users/by-email/" + email;

        try {
            UserDetailsDto userDto = restTemplate.getForObject(url, UserDetailsDto.class);

            if (userDto == null) {
                throw new Exception("User not found: " + email);
            }

            return userDto;
        } catch (Exception e) {
            throw new Exception("User not found: " + email);
        }
    }

    private List<FarmDetailsDto> getFarmsByUserId(String userId) {
        return farmRepository.findByUserId(userId).stream()
                .map(farmMapper::farmToFarmDetailsDto)
                .toList();
    }
}