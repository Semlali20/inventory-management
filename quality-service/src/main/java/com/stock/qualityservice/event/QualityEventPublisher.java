package com.stock.qualityservice.event;

import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.Quarantine;
import com.stock.qualityservice.event.outgoing.InventoryStatusUpdateEvent;
import com.stock.qualityservice.event.outgoing.QualityInspectionEvent;
import com.stock.qualityservice.event.outgoing.QuarantineEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 📢 Quality Event Publisher
 * Publishes quality-related events to Kafka for other services to consume
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QualityEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Kafka Topics
    private static final String INSPECTION_TOPIC = "quality.inspection";
    private static final String QUARANTINE_TOPIC = "quality.quarantine";
    private static final String INVENTORY_STATUS_TOPIC = "inventory.status.update";

    /**
     * 📥 Publish Inspection Created Event
     */
    public void publishInspectionCreated(QualityControl qc) {
        log.info("📢 Publishing inspection.created event for QC: {}", qc.getId());

        QualityInspectionEvent event = QualityInspectionEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("INSPECTION_CREATED")
                .eventTime(LocalDateTime.now())
                .inspectionId(UUID.fromString(qc.getId()))
                .inspectionNumber(qc.getInspectionNumber())
                .itemId(UUID.fromString(qc.getItemId()))
                .lotId(qc.getLotId() != null ? UUID.fromString(qc.getLotId()) : null)
                .serialNumber(qc.getSerialNumber())
                .quantityInspected(qc.getQuantityInspected())
                .result(null)
                .status(qc.getStatus().name())
                .inspectorId(UUID.fromString(qc.getInspectorId()))
                .disposition(null)
                .defectCount(0)
                .defectType(null)
                .notes(qc.getNotes())
                .build();

        kafkaTemplate.send(INSPECTION_TOPIC, qc.getId().toString(), event);
        log.info("✅ Inspection created event published successfully");
    }

    /**
     * ✅ Publish Inspection Completed Event (Approved)
     */
    public void publishInspectionCompleted(QualityControl qc) {
        log.info("📢 Publishing inspection.completed event for QC: {}", qc.getId());

        QualityInspectionEvent event = QualityInspectionEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("INSPECTION_COMPLETED")
                .eventTime(LocalDateTime.now())
                .inspectionId(UUID.fromString(qc.getId()))
                .inspectionNumber(qc.getInspectionNumber())
                .itemId(UUID.fromString(qc.getItemId()))
                .lotId(qc.getLotId() != null ? UUID.fromString(qc.getLotId()) : null)
                .serialNumber(qc.getSerialNumber())
                .quantityInspected(qc.getQuantityInspected())
                .result("APPROVED")
                .status(qc.getStatus().name())
                .inspectorId(qc.getInspectedBy() != null ? UUID.fromString(qc.getInspectedBy()) : UUID.fromString(qc.getInspectorId()))
                .disposition(qc.getDisposition() != null ? qc.getDisposition().name() : null)
                .defectCount(qc.getDefectCount() != null ? qc.getDefectCount() : 0)
                .defectType(qc.getDefectType())
                .notes(qc.getNotes())
                .build();

        kafkaTemplate.send(INSPECTION_TOPIC, qc.getId().toString(), event);
        log.info("✅ Inspection completed event published successfully");

        // Also publish inventory status update (make available)
        publishInventoryStatusUpdate(UUID.fromString(qc.getItemId()),
                                     qc.getLotId() != null ? UUID.fromString(qc.getLotId()) : null,
                                     "AVAILABLE", "Inspection passed");
    }

    /**
     * ❌ Publish Inspection Failed Event (Rejected)
     */
    public void publishInspectionFailed(QualityControl qc) {
        log.info("📢 Publishing inspection.failed event for QC: {}", qc.getId());

        QualityInspectionEvent event = QualityInspectionEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("INSPECTION_FAILED")
                .eventTime(LocalDateTime.now())
                .inspectionId(UUID.fromString(qc.getId()))
                .inspectionNumber(qc.getInspectionNumber())
                .itemId(UUID.fromString(qc.getItemId()))
                .lotId(qc.getLotId() != null ? UUID.fromString(qc.getLotId()) : null)
                .serialNumber(qc.getSerialNumber())
                .quantityInspected(qc.getQuantityInspected())
                .result("REJECTED")
                .status(qc.getStatus().name())
                .inspectorId(qc.getInspectedBy() != null ? UUID.fromString(qc.getInspectedBy()) : UUID.fromString(qc.getInspectorId()))
                .disposition(qc.getDisposition() != null ? qc.getDisposition().name() : null)
                .defectCount(qc.getDefectCount() != null ? qc.getDefectCount() : 0)
                .defectType(qc.getDefectType())
                .notes(qc.getNotes())
                .build();

        kafkaTemplate.send(INSPECTION_TOPIC, qc.getId().toString(), event);
        log.info("✅ Inspection failed event published successfully");
    }

    /**
     * 🚫 Publish Quarantine Created Event
     */
    public void publishQuarantineCreated(Quarantine quarantine) {
        log.info("📢 Publishing quarantine.created event for Quarantine: {}", quarantine.getId());

        QuarantineEvent event = QuarantineEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("QUARANTINE_CREATED")
                .eventTime(LocalDateTime.now())
                .quarantineId(UUID.fromString(quarantine.getId()))
                .quarantineNumber(quarantine.getQuarantineNumber())
                .itemId(UUID.fromString(quarantine.getItemId()))
                .lotId(quarantine.getLotId() != null ? UUID.fromString(quarantine.getLotId()) : null)
                .serialNumber(quarantine.getSerialNumber())
                .quantity(quarantine.getQuantity())
                .locationId(quarantine.getLocationId() != null ? UUID.fromString(quarantine.getLocationId()) : null)
                .reason(quarantine.getReason())
                .severity(quarantine.getSeverity())
                .status(quarantine.getStatus().name())
                .relatedInspectionId(quarantine.getRelatedInspectionId() != null ? UUID.fromString(quarantine.getRelatedInspectionId()) : null)
                .notes(quarantine.getNotes())
                .build();

        kafkaTemplate.send(QUARANTINE_TOPIC, quarantine.getId().toString(), event);
        log.info("✅ Quarantine created event published successfully");

        // Publish inventory status update (quarantine)
        publishInventoryStatusUpdate(UUID.fromString(quarantine.getItemId()),
                                      quarantine.getLotId() != null ? UUID.fromString(quarantine.getLotId()) : null,
                                      "QUARANTINED", "Item moved to quarantine: " + quarantine.getReason());
    }

    /**
     * ↩️ Publish Quarantine Released Event
     */
    public void publishQuarantineReleased(Quarantine quarantine) {
        log.info("📢 Publishing quarantine.released event for Quarantine: {}", quarantine.getId());

        QuarantineEvent event = QuarantineEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("QUARANTINE_RELEASED")
                .eventTime(LocalDateTime.now())
                .quarantineId(UUID.fromString(quarantine.getId()))
                .quarantineNumber(quarantine.getQuarantineNumber())
                .itemId(UUID.fromString(quarantine.getItemId()))
                .lotId(quarantine.getLotId() != null ? UUID.fromString(quarantine.getLotId()) : null)
                .serialNumber(quarantine.getSerialNumber())
                .quantity(quarantine.getQuantity())
                .locationId(quarantine.getLocationId() != null ? UUID.fromString(quarantine.getLocationId()) : null)
                .reason(quarantine.getReason())
                .severity(quarantine.getSeverity())
                .status(quarantine.getStatus().name())
                .relatedInspectionId(quarantine.getRelatedInspectionId() != null ? UUID.fromString(quarantine.getRelatedInspectionId()) : null)
                .notes(quarantine.getNotes())
                .build();

        kafkaTemplate.send(QUARANTINE_TOPIC, quarantine.getId().toString(), event);
        log.info("✅ Quarantine released event published successfully");

        // Publish inventory status update (make available)
        publishInventoryStatusUpdate(UUID.fromString(quarantine.getItemId()),
                                      quarantine.getLotId() != null ? UUID.fromString(quarantine.getLotId()) : null,
                                      "AVAILABLE", "Released from quarantine");
    }

    /**
     * 🗑️ Publish Quarantine Rejected Event (Scrap/Dispose)
     */
    public void publishQuarantineRejected(Quarantine quarantine) {
        log.info("📢 Publishing quarantine.rejected event for Quarantine: {}", quarantine.getId());

        QuarantineEvent event = QuarantineEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("QUARANTINE_REJECTED")
                .eventTime(LocalDateTime.now())
                .quarantineId(UUID.fromString(quarantine.getId()))
                .quarantineNumber(quarantine.getQuarantineNumber())
                .itemId(UUID.fromString(quarantine.getItemId()))
                .lotId(quarantine.getLotId() != null ? UUID.fromString(quarantine.getLotId()) : null)
                .serialNumber(quarantine.getSerialNumber())
                .quantity(quarantine.getQuantity())
                .locationId(quarantine.getLocationId() != null ? UUID.fromString(quarantine.getLocationId()) : null)
                .reason(quarantine.getReason())
                .severity(quarantine.getSeverity())
                .status(quarantine.getStatus().name())
                .relatedInspectionId(quarantine.getRelatedInspectionId() != null ? UUID.fromString(quarantine.getRelatedInspectionId()) : null)
                .notes(quarantine.getNotes())
                .build();

        kafkaTemplate.send(QUARANTINE_TOPIC, quarantine.getId().toString(), event);
        log.info("✅ Quarantine rejected event published successfully");

        // Publish inventory status update (scrapped/disposed)
        publishInventoryStatusUpdate(UUID.fromString(quarantine.getItemId()),
                                      quarantine.getLotId() != null ? UUID.fromString(quarantine.getLotId()) : null,
                                      "SCRAPPED", "Rejected from quarantine - disposed");
    }

    /**
     * 📊 Publish Inventory Status Update Event
     */
    public void publishInventoryStatusUpdate(UUID itemId, UUID lotId, String newStatus, String reason) {
        log.info("📢 Publishing inventory.status.update event for Item: {}, Lot: {}, Status: {}",
                 itemId, lotId, newStatus);

        InventoryStatusUpdateEvent event = InventoryStatusUpdateEvent.builder()
                .eventId(UUID.randomUUID())
                .eventType("INVENTORY_STATUS_UPDATED")
                .eventTime(LocalDateTime.now())
                .itemId(itemId)
                .lotId(lotId)
                .serialId(null)
                .oldStatus(null) // Can be enhanced to track previous status
                .newStatus(newStatus)
                .reason(reason)
                .updatedBy("QUALITY_SERVICE")
                .build();

        kafkaTemplate.send(INVENTORY_STATUS_TOPIC, itemId.toString(), event);
        log.info("✅ Inventory status update event published successfully");
    }
}
