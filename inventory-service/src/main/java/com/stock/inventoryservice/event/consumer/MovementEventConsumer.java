package com.stock.inventoryservice.event.consumer;

import com.stock.inventoryservice.dto.InventoryDTO;
import com.stock.inventoryservice.entity.Inventory;
import com.stock.inventoryservice.entity.InventoryStatus;
import com.stock.inventoryservice.event.dto.InventoryEvent;
import com.stock.inventoryservice.event.dto.MovementCompletedEvent;
import com.stock.inventoryservice.event.dto.MovementCompletedEvent.MovementLineDTO;
import com.stock.inventoryservice.repository.InventoryRepository;
import com.stock.inventoryservice.service.impl.InventoryEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * 🔥 AUTOMATIC INVENTORY UPDATE CONSUMER
 * Listens to movement.completed events and automatically updates inventory
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MovementEventConsumer {

    private final InventoryRepository inventoryRepository;
    private final InventoryEventPublisher eventPublisher;

    /**
     * 🎯 MAIN LISTENER - Processes movement completion
     */
    @KafkaListener(
            topics = "movement.completed",
            groupId = "inventory-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void handleMovementCompleted(
            @Payload MovementCompletedEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic
    ) {
        log.info("🔥🔥🔥 RECEIVED movement.completed event: {}", event.getMovementId());
        log.info("Movement Type: {}, Lines: {}", event.getMovementType(), event.getLines().size());

        try {
            // Process each product line
            for (MovementCompletedEvent.MovementLineDTO line : event.getLines()) {
                processMovementLine(event, line);
            }

            log.info("✅ Successfully processed movement {} with {} lines", 
                    event.getMovementId(), event.getLines().size());
                    
        } catch (Exception e) {
            log.error("❌ ERROR processing movement.completed: {}", event.getMovementId(), e);
            // TODO: Send to dead-letter queue
            throw e; // Retry via Kafka
        }
    }

    /**
     * 📦 Process single movement line (single product)
     */
    private void processMovementLine(MovementCompletedEvent movement, 
                                     MovementCompletedEvent.MovementLineDTO line) {
        
        log.info("Processing line {} - Item: {}, Qty: {}", 
                line.getLineId(), line.getItemId(), line.getActualQuantity());

        String movementType = movement.getMovementType().toUpperCase();
        Double quantity = line.getActualQuantity() != null ? 
                         line.getActualQuantity() : line.getRequestedQuantity();

        switch (movementType) {
            case "INBOUND":
                handleInbound(movement, line, quantity);
                break;
            case "OUTBOUND":
                handleOutbound(movement, line, quantity);
                break;
            case "TRANSFER":
                handleTransfer(movement, line, quantity);
                break;
            case "ADJUSTMENT":
                handleAdjustment(movement, line, quantity);
                break;
            default:
                log.warn("Unknown movement type: {}", movementType);
        }
    }

    /**
     * 📥 INBOUND: Receiving stock (increase inventory)
     */
    private void handleInbound(MovementCompletedEvent movement, 
                               MovementCompletedEvent.MovementLineDTO line, 
                               Double quantity) {
        
        log.info("📥 INBOUND: Adding {} units of item {} to location {}", 
                quantity, line.getItemId(), movement.getDestinationLocationId());

        String itemId = line.getItemId().toString();
        String locationId = movement.getDestinationLocationId().toString();
        String warehouseId = movement.getWarehouseId().toString();

        // Find or create inventory record
        Inventory inventory = inventoryRepository
                .findByItemIdAndLocationId(itemId, locationId)
                .orElseGet(() -> createNewInventory(itemId, warehouseId, locationId, line));

        // ✅ INCREASE quantity
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity);
        inventory.setLastCountDate(LocalDate.now());

        Inventory saved = inventoryRepository.save(inventory);
        log.info("✅ Increased inventory: {} units now at location {}", 
                saved.getQuantityOnHand(), locationId);

        // Publish event
        publishInventoryUpdate(saved, "INBOUND_RECEIVED", quantity);
    }

    /**
     * 📤 OUTBOUND: Shipping stock (decrease inventory)
     */
    private void handleOutbound(MovementCompletedEvent movement, 
                                MovementCompletedEvent.MovementLineDTO line, 
                                Double quantity) {
        
        log.info("📤 OUTBOUND: Removing {} units of item {} from location {}", 
                quantity, line.getItemId(), movement.getSourceLocationId());

        String itemId = line.getItemId().toString();
        String locationId = movement.getSourceLocationId().toString();

        Inventory inventory = inventoryRepository
                .findByItemIdAndLocationId(itemId, locationId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for outbound movement"));

        // ✅ DECREASE quantity & release reservation
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
        inventory.setQuantityReserved(Math.max(0, inventory.getQuantityReserved() - quantity));
        inventory.setLastCountDate(LocalDate.now());

        Inventory saved = inventoryRepository.save(inventory);
        log.info("✅ Decreased inventory: {} units remain at location {}", 
                saved.getQuantityOnHand(), locationId);

        publishInventoryUpdate(saved, "OUTBOUND_SHIPPED", -quantity);
    }

    /**
     * 🔄 TRANSFER: Move between locations (decrease source, increase destination)
     */
    private void handleTransfer(MovementCompletedEvent movement, 
                                MovementCompletedEvent.MovementLineDTO line, 
                                Double quantity) {
        
        log.info("🔄 TRANSFER: Moving {} units from {} to {}", 
                quantity, movement.getSourceLocationId(), movement.getDestinationLocationId());

        String itemId = line.getItemId().toString();
        String sourceLocationId = movement.getSourceLocationId().toString();
        String destLocationId = movement.getDestinationLocationId().toString();
        String warehouseId = movement.getWarehouseId().toString();

        // 1️⃣ DECREASE from source
        Inventory sourceInventory = inventoryRepository
                .findByItemIdAndLocationId(itemId, sourceLocationId)
                .orElseThrow(() -> new RuntimeException("Source inventory not found"));

        sourceInventory.setQuantityOnHand(sourceInventory.getQuantityOnHand() - quantity);
        sourceInventory.setQuantityReserved(Math.max(0, sourceInventory.getQuantityReserved() - quantity));
        inventoryRepository.save(sourceInventory);
        log.info("✅ Decreased source: {} units remain", sourceInventory.getQuantityOnHand());

        // 2️⃣ INCREASE at destination
        Inventory destInventory = inventoryRepository
                .findByItemIdAndLocationId(itemId, destLocationId)
                .orElseGet(() -> createNewInventory(itemId, warehouseId, destLocationId, line));

        destInventory.setQuantityOnHand(destInventory.getQuantityOnHand() + quantity);
        Inventory savedDest = inventoryRepository.save(destInventory);
        log.info("✅ Increased destination: {} units now available", savedDest.getQuantityOnHand());

        publishInventoryUpdate(savedDest, "TRANSFER_COMPLETED", quantity);
    }

    /**
     * ⚖️ ADJUSTMENT: Inventory correction (cycle count, damage, etc.)
     */
    private void handleAdjustment(MovementCompletedEvent movement, 
                                  MovementCompletedEvent.MovementLineDTO line, 
                                  Double quantity) {
        
        log.info("⚖️ ADJUSTMENT: Adjusting item {} by {} units", 
                line.getItemId(), quantity);

        String itemId = line.getItemId().toString();
        String locationId = line.getToLocationId() != null ? 
                           line.getToLocationId().toString() : 
                           movement.getDestinationLocationId().toString();

        Inventory inventory = inventoryRepository
                .findByItemIdAndLocationId(itemId, locationId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for adjustment"));

        // ✅ SET new quantity (not add/subtract)
        Double oldQuantity = inventory.getQuantityOnHand();
        inventory.setQuantityOnHand(quantity);
        inventory.setLastCountDate(LocalDate.now());

        Inventory saved = inventoryRepository.save(inventory);
        log.info("✅ Adjusted inventory: {} → {} units", oldQuantity, quantity);

        publishInventoryUpdate(saved, "ADJUSTMENT", quantity - oldQuantity);
    }

    /**
     * 🆕 Create new inventory record
     */
    private Inventory createNewInventory(String itemId, String warehouseId, 
                                        String locationId, MovementCompletedEvent.MovementLineDTO line) {
        
        log.info("🆕 Creating new inventory record for item {} at location {}", itemId, locationId);

        return Inventory.builder()
                .itemId(itemId)
                .warehouseId(warehouseId)
                .locationId(locationId)
                .lotId(line.getLotId() != null ? line.getLotId().toString() : null)
                .serialId(line.getSerialId() != null ? line.getSerialId().toString() : null)
                .quantityOnHand(0.0)
                .quantityReserved(0.0)
                .quantityDamaged(0.0)
                .status(InventoryStatus.AVAILABLE)
                .uom(line.getUom())
                .build();
    }

    /**
     * 📢 Publish inventory update event
     */
    private void publishInventoryUpdate(Inventory inventory, String reason, Double delta) {
        com.stock.inventoryservice.event.dto.InventoryEvent event = 
            com.stock.inventoryservice.event.dto.InventoryEvent.builder()
                .inventoryId(inventory.getId())
                .itemId(inventory.getItemId())
                .warehouseId(inventory.getWarehouseId())
                .locationId(inventory.getLocationId())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .availableQuantity(inventory.getAvailableQuantity())
                .eventType("UPDATED")
                .reason(reason + " (Delta: " + delta + ")")
                .timestamp(java.time.LocalDateTime.now())
                .build();

        eventPublisher.publishInventoryEvent(event);
    }
}