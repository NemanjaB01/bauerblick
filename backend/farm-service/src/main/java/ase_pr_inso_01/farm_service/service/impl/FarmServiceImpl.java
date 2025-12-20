package ase_pr_inso_01.farm_service.service.impl;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmsForUserDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.UserDetailsDto;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.repository.FarmRepository;
import ase_pr_inso_01.farm_service.service.FarmService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.List;


@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final RestTemplate restTemplate;

    public FarmServiceImpl(FarmRepository farmRepository, RestTemplate restTemplate) {
        this.farmRepository = farmRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public Farm createFarm(FarmCreateDto dto) throws Exception {
        UserDetailsDto user = this.getUser(dto.getEmail());

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
        farm.setUserId(user.getId());

        return farmRepository.save(farm);
    }

    @Override
    public Farm getFarmByName(String name) {
        return null;
    }

    @Override
    public List<FarmsForUserDto> getFarmsByUserId(String userId) {

        List<Farm> farms = farmRepository.findByUserId(userId);

        return farms.stream()
                .map(f -> new FarmsForUserDto(
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
    private UserDetailsDto getUser(String email) throws Exception {
        //TODO: Check if possible to replace localhost with service name
        String url = "http://localhost:8081/api/users/by-email/" + email;

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