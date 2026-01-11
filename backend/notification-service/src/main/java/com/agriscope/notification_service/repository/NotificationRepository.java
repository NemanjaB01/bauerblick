// AlertRepository.java
package com.agriscope.notification_service.repository;

import com.agriscope.notification_service.model.NotificationDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<NotificationDocument, String> {
    List<NotificationDocument> findByFarmIdOrderByCreatedAtDesc(String farmId);

    List<NotificationDocument> findByFarmIdAndReadFalseOrderByCreatedAtDesc(String farmId);
}