package ase_pr_inso_01.farm_service.service;

import ase_pr_inso_01.farm_service.models.Farm;
import ase_pr_inso_01.farm_service.models.Field;
import ase_pr_inso_01.farm_service.models.Seed;
import ase_pr_inso_01.farm_service.models.enums.FieldStatus;
import ase_pr_inso_01.farm_service.models.enums.GrowthStage;
import ase_pr_inso_01.farm_service.repository.FarmRepository;
import ase_pr_inso_01.farm_service.repository.SeedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrowthStageScheduler {

    private final FarmRepository farmRepository;
    private final SeedRepository seedRepository;
    private final SeedService seedService;

    @Scheduled(cron = "0 0 0 * * ?")
//    @Scheduled(fixedRate = 60000)
    public void updateGrowthStages() {
        log.info("Starting daily growth stage update...");

        Map<String, Seed> seedMap = seedRepository.findAll().stream()
                .collect(Collectors.toMap(s -> s.getSeedType().name(), Function.identity()));

        List<Farm> farms = farmRepository.findAll();
        int updatedCount = 0;

        for (Farm farm : farms) {
            boolean farmChanged = false;

            if (farm.getFields() == null) continue;

            for (Field field : farm.getFields()) {
                if (field.getStatus() == FieldStatus.PLANTED && field.getPlantedDate() != null) {

                    Seed seedRule = seedMap.get(field.getSeedType().name());
                    if (seedRule == null) continue;

                    long daysElapsed = calculateDaysElapsed(field.getPlantedDate());

                    GrowthStage newStage = determineStage(daysElapsed, seedRule);

                    if (newStage != field.getGrowthStage()) {
                        log.info("Updating Field {} ({}): {} -> {}",
                                field.getId(), field.getSeedType(), field.getGrowthStage(), newStage);

                        field.setGrowthStage(newStage);
                        farmChanged = true;
                        updatedCount++;
                    }
                }
            }

            if (farmChanged) {
                farmRepository.save(farm);
            }
        }

        log.info("Growth stage update completed. Updated {} fields.", updatedCount);
    }

    private long calculateDaysElapsed(Date plantedDate) {
        LocalDate planted = plantedDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate now = LocalDate.now();
        return ChronoUnit.DAYS.between(planted, now);
    }

    private GrowthStage determineStage(long days, Seed seed) {
        if (days >= seed.getDaysToReady()) {
            return GrowthStage.READY;
        } else if (days >= seed.getDaysToMature()) {
            return GrowthStage.MATURE;
        } else if (days >= seed.getDaysToYoung()) {
            return GrowthStage.YOUNG;
        } else {
            return GrowthStage.SEEDLING;
        }
    }
}