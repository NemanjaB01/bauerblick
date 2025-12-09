package ase_pr_inso_01.farm_service.controller;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.exception.ConflictException;
import ase_pr_inso_01.farm_service.exception.ValidationException;
import ase_pr_inso_01.farm_service.service.FarmService;


import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(value = "/api/farms")
public class FarmController {
    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping
    public void createFarm(@RequestBody FarmCreateDto farm) throws ValidationException, ConflictException {
        farmService.createFarm(farm);
    }

}
