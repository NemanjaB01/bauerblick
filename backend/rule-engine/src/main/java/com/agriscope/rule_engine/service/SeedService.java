package com.agriscope.rule_engine.service;

import com.agriscope.rule_engine.domain.enums.SeedType;
import com.agriscope.rule_engine.domain.model.Seed;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class SeedService {

    private Map<SeedType, Seed> seedDatabase = new HashMap<>();

    @PostConstruct
    public void init() {
        log.info("Initializing seed database");

        seedDatabase.put(SeedType.WHEAT, createWheatSeed());
        seedDatabase.put(SeedType.CORN, createCornSeed());
        seedDatabase.put(SeedType.BARLEY, createBarleySeed());
        seedDatabase.put(SeedType.PUMPKIN, createPumpkinSeed());
        seedDatabase.put(SeedType.BLACK_GRAPES, createBlackGrapesSeed());
        seedDatabase.put(SeedType.WHITE_GRAPES, createWhiteGrapesSeed());
    }

    private Seed createWheatSeed() {
        Seed wheat = new Seed();
        wheat.setSeedType(SeedType.WHEAT);
        wheat.setDisplayName("Wheat");
        wheat.setScientificName("Triticum aestivum");
        wheat.setMinTemperature(3.0);
        wheat.setMaxTemperature(30.0);
        wheat.setWaterRequirement(5.0);
        wheat.setHeatStressTemperature(30.0);
        wheat.setHeavyRainThreshold(10.0);
        wheat.setSeedCoefficient(1.15);
        wheat.setMinSoilMoisture(0.25);
        wheat.setAllowedWaterDeficit(5.0);

        return wheat;
    }

    private Seed createCornSeed() {
        Seed corn = new Seed();
        corn.setSeedType(SeedType.CORN);
        corn.setDisplayName("Corn");
        corn.setScientificName("Zea mays");
        corn.setMinTemperature(2.0);
        corn.setMaxTemperature(35.0);
        corn.setWaterRequirement(8.0);
        corn.setHeatStressTemperature(35.0);
        corn.setHeavyRainThreshold(15.0);
        corn.setSeedCoefficient(1.20);
        corn.setMinSoilMoisture(0.35);
        corn.setAllowedWaterDeficit(2.5);
        return corn;
    }

    private Seed createBarleySeed() {
        Seed barley = new Seed();
        barley.setSeedType(SeedType.BARLEY);
        barley.setDisplayName("Barley");
        barley.setScientificName("Hordeum vulgare");
        barley.setMinTemperature(2.0);
        barley.setMaxTemperature(28.0);
        barley.setWaterRequirement(4.5);
        barley.setHeatStressTemperature(28.0);
        barley.setHeavyRainThreshold(12.0);
        barley.setSeedCoefficient(1.15);
        barley.setMinSoilMoisture(0.28);
        barley.setAllowedWaterDeficit(4.0);
        return barley;
    }

    private Seed createPumpkinSeed() {
        Seed pumpkin = new Seed();
        pumpkin.setSeedType(SeedType.PUMPKIN);
        pumpkin.setDisplayName("Pumpkin");
        pumpkin.setScientificName("Cucurbita pepo");
        pumpkin.setMinTemperature(5.0);
        pumpkin.setMaxTemperature(32.0);
        pumpkin.setWaterRequirement(7.0);
        pumpkin.setHeatStressTemperature(32.0);
        pumpkin.setHeavyRainThreshold(20.0);
        pumpkin.setSeedCoefficient(1.00);
        pumpkin.setMinSoilMoisture(0.30);
        pumpkin.setAllowedWaterDeficit(3.0);
        return pumpkin;
    }

    private Seed createBlackGrapesSeed() {
        Seed grapes = new Seed();
        grapes.setSeedType(SeedType.BLACK_GRAPES);
        grapes.setDisplayName("Black Grapes");
        grapes.setScientificName("Vitis vinifera");
        grapes.setMinTemperature(2.0);
        grapes.setMaxTemperature(35.0);
        grapes.setWaterRequirement(6.0);
        grapes.setHeatStressTemperature(35.0);
        grapes.setHeavyRainThreshold(15.0);
        grapes.setSeedCoefficient(0.75);
        grapes.setMinSoilMoisture(0.22);
        grapes.setAllowedWaterDeficit(6.0);
        return grapes;
    }

    private Seed createWhiteGrapesSeed() {
        Seed grapes = new Seed();
        grapes.setSeedType(SeedType.WHITE_GRAPES);
        grapes.setDisplayName("White Grapes");
        grapes.setScientificName("Vitis vinifera");
        grapes.setMinTemperature(1.0);
        grapes.setMaxTemperature(32.0);
        grapes.setWaterRequirement(5.5);
        grapes.setHeatStressTemperature(32.0);
        grapes.setHeavyRainThreshold(15.0);
        grapes.setSeedCoefficient(0.70);
        grapes.setMinSoilMoisture(0.25);
        grapes.setAllowedWaterDeficit(5.5);
        return grapes;
    }

    @Cacheable(value="seeds", key="#seedType.name()")
    public Seed getSeed(SeedType seedType) {
        log.info("Loading seed configuration from DB/memory for type: {}", seedType);
        Seed seed = seedDatabase.get(seedType);
        if (seed == null) {
            log.error("Seed not configured for type: {}, returning wheat as default", seedType);
            return seedDatabase.get(SeedType.WHEAT);
        }
        return seed;
    }

}