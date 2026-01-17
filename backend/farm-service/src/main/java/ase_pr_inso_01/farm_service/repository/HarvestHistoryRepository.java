package ase_pr_inso_01.farm_service.repository;

import ase_pr_inso_01.farm_service.models.HarvestHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface HarvestHistoryRepository extends MongoRepository<HarvestHistory, String> {
    List<HarvestHistory> findByFarmId(String farmId);
}