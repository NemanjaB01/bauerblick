package ase_pr_inso_01.farm_service.controller;

import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCheckDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmCreateDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FarmDetailsDto;
import ase_pr_inso_01.farm_service.controller.dto.farm.FieldDetailsDto;
import ase_pr_inso_01.farm_service.service.FarmService;


import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.invoke.MethodHandles;
import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping(value = "/api/farms")
@CrossOrigin(origins = "http://localhost:4200")
public class FarmController {
    private final FarmService farmService;
    private static final Logger LOG = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());
    static final String BASE_PATH = "/farms";

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping
    public ResponseEntity<FarmDetailsDto> createFarm(Principal principal, @Valid @RequestBody FarmCreateDto farm) throws Exception {
        LOG.info("POST " + BASE_PATH + "/{}", farm);
        LOG.debug("Body of request:\n{}", farm);

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();

        FarmDetailsDto createdFarm = farmService.createFarm(farm, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFarm);
    }

    /**
     * Check if user has any farms.
     */
    @GetMapping("/check")
    public ResponseEntity<FarmCheckDto> checkUserHasFarms(Principal principal) throws Exception {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        FarmCheckDto checkDto = farmService.checkUserHasFarms(email);
        return ResponseEntity.ok(checkDto);
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

    @GetMapping("/{farmId}")
    public ResponseEntity<FarmDetailsDto> getFarmById(@PathVariable String farmId, Principal principal) throws Exception {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();
        FarmDetailsDto farm = farmService.getFarmById(farmId, email);
        return ResponseEntity.ok(farm);
    }

    @PutMapping("/{farmId}/fields") // TODO: Maybe change this to PATCH
    public ResponseEntity<FarmDetailsDto> updateField(@PathVariable String farmId, @RequestBody FieldDetailsDto field, Principal principal) throws Exception {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();  // Extract email from JWT

        FarmDetailsDto updatedFarm = farmService.updateField(farmId, field, email);
        return ResponseEntity.ok(updatedFarm);
    }
}
