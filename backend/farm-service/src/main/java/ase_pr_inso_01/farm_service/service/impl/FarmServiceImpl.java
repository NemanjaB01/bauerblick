package ase_pr_inso_01.farm_service.service.impl;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmDetailsDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FieldUpdateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.UserDetailsDto;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.repository.FarmRepository;
import ase_pr_inso_01.farm_service.service.FarmService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;


@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final RestTemplate restTemplate;

    public FarmServiceImpl(FarmRepository farmRepository, RestTemplate restTemplate) {
        this.farmRepository = farmRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public Farm createFarm(FarmCreateDto dto, String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);

        if (farmRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Farm already registered");
        }

        Farm farm = new Farm();
        farm.setName(dto.getName());
        farm.setLatitude(dto.getLatitude());
        farm.setLongitude(dto.getLongitude());
        farm.setSoilType(dto.getSoilType());
        farm.setFields(dto.getFields());
        farm.setUserId(user.getId());

        return farmRepository.save(farm);
    }

    @Override
    public Farm getFarmByName(String name) {
        return null;
    }

    @Override
    public List<FarmDetailsDto> getFarmsByUserEmail(String email) throws Exception {
        UserDetailsDto user = this.getUserDetails(email);
        return this.getFarmsByUserId(user.getId());
    }

    @Override
    public void updateField(String farmId, FieldUpdateDto fieldUpdate) {
        // Fetch the farm by ID
        Optional<Farm> optionalFarm = farmRepository.findById(farmId);

        if (optionalFarm.isEmpty()) {
            throw new RuntimeException("Farm not found with ID: " + farmId);
        }

        Farm farm = optionalFarm.get();
        List<Field> fields = List.of(farm.getFields());  // Assuming fields is a List<Field>

        // Find the field to update using Java Streams
        Field fieldToUpdate = fields.stream()
                .filter(f -> f.getId().equals(fieldUpdate.getId()))  // Match by field ID
                .findFirst()  // Get the first matching field
                .orElseThrow(() -> new RuntimeException("Field not found with ID: " + fieldUpdate.getId()));  // If not found, throw exception

        // Update the found field
        fieldToUpdate.setStatus(fieldUpdate.getStatus());
        fieldToUpdate.setSeedType(fieldUpdate.getSeedType());
        fieldToUpdate.setPlantedDate(fieldUpdate.getPlantedDate());
        fieldToUpdate.setGrowthStage(fieldUpdate.getGrowthStage());

        // Save the updated farm back to MongoDB
        farmRepository.save(farm);
    }



    @Override
    public List<FarmDetailsDto> getFarmsByUserId(String userId) {
        List<Farm> farms = farmRepository.findByUserId(userId);

        return farms.stream()
                .map(f -> new FarmDetailsDto(
                        f.getId(),
                        f.getName(),
                        f.getLocation(),
                        f.getLatitude(),
                        f.getLongitude(),
                        f.getSoilType(),
                        f.getFields(),
                        f.getRecommendations(),
                        f.getUserId()
                ))
                .toList();
    }

    // Fetch user details from the User microservice
    private UserDetailsDto getUserDetails(String email) throws Exception {
        //TODO: Check if possible to replace localhost with service name
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
}