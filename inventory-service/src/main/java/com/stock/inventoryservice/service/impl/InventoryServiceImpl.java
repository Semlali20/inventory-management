// InventoryServiceImpl.java
package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.dto.InventoryDTO;
import com.stock.inventoryservice.entity.Inventory;
import com.stock.inventoryservice.event.EventPublisher;
import com.stock.inventoryservice.event.InventoryUpdatedEvent;
import com.stock.inventoryservice.event.StockBelowThresholdEvent;
import com.stock.inventoryservice.exception.InsufficientStockException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.InventoryRepository;
import com.stock.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final EventPublisher eventPublisher;

    private static final BigDecimal LOW_STOCK_THRESHOLD = new BigDecimal("10");

    @Override
    public InventoryDTO createInventory(Inventory inventory) {
        log.info("Creating inventory for item: {} at location: {}",
                inventory.getItemId(), inventory.getLocationId());

        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Inventory created successfully with ID: {}", savedInventory.getId());

        return mapToDTO(savedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDTO getInventoryById(String id) {
        log.info("Fetching inventory with ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        return mapToDTO(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getAllInventories() {
        log.info("Fetching all inventories");

        return inventoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventoriesByItemId(String itemId) {
        log.info("Fetching inventories for item ID: {}", itemId);

        return inventoryRepository.findByItemId(itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventoriesByLocationId(String locationId) {
        log.info("Fetching inventories for location ID: {}", locationId);

        return inventoryRepository.findByLocationId(locationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDTO getInventoryByItemAndLocation(String itemId, String locationId) {
        log.info("Fetching inventory for item: {} at location: {}", itemId, locationId);

        Inventory inventory = inventoryRepository.findByItemIdAndLocationId(itemId, locationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for item: " + itemId + " at location: " + locationId));

        return mapToDTO(inventory);
    }

    @Override
    public InventoryDTO updateInventory(String id, Inventory inventoryUpdate) {
        log.info("Updating inventory with ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        Double oldQuantity = inventory.getQuantityOnHand();

        inventory.setItemId(inventoryUpdate.getItemId());
        inventory.setLocationId(inventoryUpdate.getLocationId());
        inventory.setQuantityOnHand(inventoryUpdate.getQuantityOnHand());
        inventory.setQuantityReserved(inventoryUpdate.getQuantityReserved());
        inventory.setQuantityDamaged(inventoryUpdate.getQuantityDamaged());
        inventory.setLotId(inventoryUpdate.getLotId());
        inventory.setSerialId(inventoryUpdate.getSerialId());

        Inventory updatedInventory = inventoryRepository.save(inventory);
        log.info("Inventory updated successfully with ID: {}", updatedInventory.getId());

        // Publish event
        publishInventoryUpdatedEvent(updatedInventory, BigDecimal.valueOf(oldQuantity), "UPDATE");

        return mapToDTO(updatedInventory);
    }

    @Override
    public void deleteInventory(String id) {
        log.info("Deleting inventory with ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        inventoryRepository.delete(inventory);
        log.info("Inventory deleted successfully with ID: {}", id);
    }

    @Override
    public InventoryDTO adjustQuantity(String id, BigDecimal quantityChange, String reason) {
        log.info("Adjusting quantity for inventory ID: {} by {}", id, quantityChange);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        Double oldQuantity = inventory.getQuantityOnHand();
        Double newQuantity = oldQuantity + quantityChange.doubleValue();

        if (newQuantity < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock. Current: " + oldQuantity + ", Requested change: " + quantityChange);
        }

        inventory.setQuantityOnHand(newQuantity);
        inventory.setLastMovementAt(LocalDateTime.now());
        Inventory updatedInventory = inventoryRepository.save(inventory);

        log.info("Quantity adjusted successfully. Old: {}, New: {}", oldQuantity, newQuantity);

        // Publish events
        publishInventoryUpdatedEvent(updatedInventory, BigDecimal.valueOf(oldQuantity), reason);
        checkAndPublishLowStockAlert(updatedInventory);

        return mapToDTO(updatedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalQuantityByItem(String itemId) {
        log.info("Calculating total quantity for item ID: {}", itemId);

        BigDecimal totalQuantity = inventoryRepository.getTotalQuantityByItem(itemId);
        return totalQuantity != null ? totalQuantity : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getLowStockInventories(BigDecimal threshold) {
        log.info("Fetching low stock inventories with threshold: {}", threshold);

        return inventoryRepository.findLowStockInventories(threshold).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDTO transferStock(String fromInventoryId, String toLocationId, BigDecimal quantity) {
        log.info("Transferring {} units from inventory {} to location {}",
                quantity, fromInventoryId, toLocationId);

        // Validate quantity
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer quantity must be positive");
        }

        // Get source inventory
        Inventory fromInventory = inventoryRepository.findById(fromInventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Source inventory not found with ID: " + fromInventoryId));

        // Check sufficient stock
        if (fromInventory.getQuantityOnHand() < quantity.doubleValue()) {
            throw new InsufficientStockException(
                    "Insufficient stock for transfer. Available: " + fromInventory.getQuantityOnHand() +
                            ", Requested: " + quantity);
        }

        // Deduct from source
        Double oldFromQuantity = fromInventory.getQuantityOnHand();
        fromInventory.setQuantityOnHand(oldFromQuantity - quantity.doubleValue());
        fromInventory.setLastMovementAt(LocalDateTime.now());
        inventoryRepository.save(fromInventory);

        // Add to destination (or create new inventory record)
        Inventory toInventory = inventoryRepository.findByItemIdAndLocationId(
                        fromInventory.getItemId(), toLocationId)
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setItemId(fromInventory.getItemId());
                    newInventory.setWarehouseId(fromInventory.getWarehouseId());
                    newInventory.setLocationId(toLocationId);
                    newInventory.setQuantityOnHand(0.0);
                    newInventory.setQuantityReserved(0.0);
                    newInventory.setQuantityDamaged(0.0);
                    newInventory.setLotId(fromInventory.getLotId());
                    newInventory.setSerialId(fromInventory.getSerialId());
                    newInventory.setStatus(fromInventory.getStatus());
                    return newInventory;
                });

        Double oldToQuantity = toInventory.getQuantityOnHand();
        toInventory.setQuantityOnHand(oldToQuantity + quantity.doubleValue());
        toInventory.setLastMovementAt(LocalDateTime.now());
        Inventory savedToInventory = inventoryRepository.save(toInventory);

        log.info("Stock transfer completed successfully");

        // Publish events
        publishInventoryUpdatedEvent(fromInventory, BigDecimal.valueOf(oldFromQuantity), "TRANSFER_OUT");
        publishInventoryUpdatedEvent(savedToInventory, BigDecimal.valueOf(oldToQuantity), "TRANSFER_IN");
        checkAndPublishLowStockAlert(fromInventory);

        return mapToDTO(savedToInventory);
    }

    // Helper methods

    private void publishInventoryUpdatedEvent(Inventory inventory, BigDecimal oldQuantity, String reason) {
        InventoryUpdatedEvent event = InventoryUpdatedEvent.builder()
                .inventoryId(inventory.getId())
                .itemId(inventory.getItemId())
                .locationId(inventory.getLocationId())
                .oldQuantity(oldQuantity)
                .newQuantity(BigDecimal.valueOf(inventory.getQuantityOnHand()))
                .quantityChange(BigDecimal.valueOf(inventory.getQuantityOnHand()).subtract(oldQuantity))
                .movementType(reason)
                .reason(reason)
                .timestamp(LocalDateTime.now())
                .build();

        eventPublisher.publishInventoryUpdated(event);
    }

    private void checkAndPublishLowStockAlert(Inventory inventory) {
        if (BigDecimal.valueOf(inventory.getQuantityOnHand()).compareTo(LOW_STOCK_THRESHOLD) < 0) {
            StockBelowThresholdEvent event = StockBelowThresholdEvent.builder()
                    .itemId(inventory.getItemId())
                    .locationId(inventory.getLocationId())
                    .currentQuantity(BigDecimal.valueOf(inventory.getQuantityOnHand()))
                    .minThreshold(LOW_STOCK_THRESHOLD)
                    .alertLevel(inventory.getQuantityOnHand() == 0 ? "CRITICAL" : "WARNING")
                    .timestamp(LocalDateTime.now())
                    .build();

            eventPublisher.publishStockBelowThreshold(event);
        }
    }

    private InventoryDTO mapToDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .itemId(inventory.getItemId())
                .locationId(inventory.getLocationId())
                .quantity(BigDecimal.valueOf(inventory.getQuantityOnHand()))
                .lotId(inventory.getLotId())
                .serialId(inventory.getSerialId())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}