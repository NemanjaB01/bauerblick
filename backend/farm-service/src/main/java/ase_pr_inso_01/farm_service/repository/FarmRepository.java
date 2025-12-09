package ase_pr_inso_01.farm_service.repository;

import ase_pr_inso_01.farm_service.models.Farm;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FarmRepository extends MongoRepository<Farm, String> {
    boolean existsByName(String name);
}
