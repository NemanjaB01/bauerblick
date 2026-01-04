package ase_pr_inso_01.farm_service.controller;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmDetailsDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FieldUpdateDto;
import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.service.FarmService;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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
    public ResponseEntity<Farm> createFarm(Principal principal, @RequestBody FarmCreateDto farm) throws Exception {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();  // Extract email from JWT

        Farm created = farmService.createFarm(farm, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);

    }

    @GetMapping
    public ResponseEntity<List<FarmDetailsDto>> getFarmsForUser(Principal principal) throws Exception {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();  // Extract email from JWT

        List<FarmDetailsDto> farms = farmService.getFarmsByUserEmail(email);
        return ResponseEntity.ok(farms);
    }

    @PutMapping("/{farmId}/fields") // TODO: Maybe change this to PATCH
    public ResponseEntity<Void> updateField(@PathVariable String farmId, @RequestBody FieldUpdateDto field, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        farmService.updateField(farmId, field);
        return ResponseEntity.status(200).build();
    }


//    @GetMapping("/user/{userId}")
//    public ResponseEntity<List<FarmsForUserDto>> getFarmsByUserId(@PathVariable String userId) {
//        List<FarmsForUserDto> farms = farmService.getFarmsByUserId(userId);
//        return ResponseEntity.ok(farms);
//    }
}
