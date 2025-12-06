package ase_pr_inso_01.farm_service.controller;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.exception.ConflictException;
import ase_pr_inso_01.farm_service.exception.ValidationException;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.service.FarmService;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(value = "/api/farms")
@CrossOrigin(origins = "http://localhost:4200")
public class FarmController {
    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping("/create")
    public ResponseEntity<Farm> createFarm(@RequestBody FarmCreateDto farm) throws ValidationException, ConflictException {
        Farm created = farmService.createFarm(farm);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);

    }

    @GetMapping
    public void getAllFarms() {
        farmService.getFarmByName("farm");
    }

}
