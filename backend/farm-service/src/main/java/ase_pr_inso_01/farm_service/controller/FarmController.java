package ase_pr_inso_01.farm_service.controller;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmsForUserDto;
import ase_pr_inso_01.farm_service.exception.ConflictException;
import ase_pr_inso_01.farm_service.exception.ValidationException;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.service.FarmService;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(value = "/api/farms")
@CrossOrigin(origins = "http://localhost:4200")
public class FarmController {
    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping
    public ResponseEntity<Farm> createFarm(@RequestBody FarmCreateDto farm) throws Exception {
        Farm created = farmService.createFarm(farm);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);

    }

    @GetMapping
    public void getAllFarms() {
        farmService.getFarmByName("farm");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FarmsForUserDto>> getFarmsByUserId(@PathVariable String userId) {
        List<FarmsForUserDto> farms = farmService.getFarmsByUserId(userId);
        return ResponseEntity.ok(farms);
    }
}
