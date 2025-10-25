package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.dto.*;
import com.stock.inventoryservice.dto.cache.ItemCacheDTO;
import com.stock.inventoryservice.dto.request.InventoryAdjustmentRequest;
import com.stock.inventoryservice.dto.request.InventoryCreateRequest;
import com.stock.inventoryservice.dto.request.InventoryTransferRequest;
import com.stock.inventoryservice.entity.Inventory;
import com.stock.inventoryservice.entity.InventoryStatus;

import com.stock.inventoryservice.exception.InsufficientStockException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.InventoryRepository;
import com.stock.inventoryservice.service.InventoryService;
import com.stock.inventoryservice.service.ItemCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ItemCacheService itemCacheService;
    private final InventoryEventPublisher eventPublisher;

    @Override
    public InventoryDTO createInventory(InventoryCreateRequest request) {
        log.info("Creating inventory for item: {} at location: {}",
                request.getItemId(), request.getLocationId());

        // Verify item exists in cache (throws exception if not found)
        ItemCacheDTO item = itemCacheService.getItem(request.getItemId());

        // Check if inventory already exists
        inventoryRepository.findByItemIdAndLocationId(request.getItemId(), request.getLocationId())
                .ifPresent(inv -> {
                    throw new IllegalStateException(
                            "Inventory already exists for item: " + request.getItemId() +
                                    " at location: " + request.getLocationId());
                });

        Inventory inventory = Inventory.builder()
                .itemId(request.getItemId())
                .warehouseId(request.getWarehouseId())
                .locationId(request.getLocationId())
                .lotId(request.getLotId())
                .serialId(request.getSerialId())
                .quantityOnHand(request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0.0)
                .quantityReserved(0.0)
                .quantityDamaged(0.0)
                .uom(request.getUom())
                .status(InventoryStatus.AVAILABLE)
                .cost(request.getCost())
                .expiryDate(request.getExpiryDate())
                .manufactureDate(request.getManufactureDate())
                .attributes(request.getAttributes())
                .build();

        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Inventory created successfully with ID: {}", savedInventory.getId());

        publishInventoryEvent(savedInventory, "CREATED");

        return mapToDTO(savedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDTO getInventoryById(String id) {
        log.debug("Fetching inventory with ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        return mapToDTO(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getAllInventories() {
        log.debug("Fetching all inventories");

        return inventoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventoriesByItemId(String itemId) {
        log.debug("Fetching inventories for item: {}", itemId);

        return inventoryRepository.findByItemId(itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventoriesByWarehouseId(String warehouseId) {
        log.debug("Fetching inventories for warehouse: {}", warehouseId);

        return inventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventoriesByLocationId(String locationId) {
        log.debug("Fetching inventories for location: {}", locationId);

        return inventoryRepository.findByLocationId(locationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDTO getInventoryByItemAndLocation(String itemId, String locationId) {
        log.debug("Fetching inventory for item: {} at location: {}", itemId, locationId);

        Inventory inventory = inventoryRepository.findByItemIdAndLocationId(itemId, locationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for item: " + itemId + " at location: " + locationId));

        return mapToDTO(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getLowStockItems(Double threshold) {
        log.debug("Fetching low stock items with threshold: {}", threshold);

        return inventoryRepository.findByQuantityOnHandLessThan(threshold).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDTO> getExpiringItems(int daysFromNow) {
        log.debug("Fetching items expiring in {} days", daysFromNow);

        LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

        return inventoryRepository.findByExpiryDateBefore(cutoffDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDTO adjustQuantity(String id, InventoryAdjustmentRequest request) {
        log.info("Adjusting quantity for inventory: {} by {}", id, request.getQuantityChange());

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        Double previousQuantity = inventory.getQuantityOnHand();
        Double newQuantity = previousQuantity + request.getQuantityChange();

        if (newQuantity < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock. Current: " + previousQuantity + ", Requested: " + request.getQuantityChange());
        }

        inventory.setQuantityOnHand(newQuantity);
        inventory.setLastMovementAt(LocalDateTime.now());

        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Quantity adjusted from {} to {}", previousQuantity, newQuantity);

        publishInventoryEvent(savedInventory, "ADJUSTED");

        return mapToDTO(savedInventory);
    }

    @Override
    public InventoryDTO reserveQuantity(String id, Double quantity) {
        log.info("Reserving quantity {} for inventory: {}", quantity, id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        Double available = inventory.getAvailableQuantity();

        if (available < quantity) {
            throw new InsufficientStockException(
                    "Insufficient available stock. Available: " + available + ", Requested: " + quantity);
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);

        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Reserved {} units. Total reserved: {}", quantity, savedInventory.getQuantityReserved());

        publishInventoryEvent(savedInventory, "RESERVED");

        return mapToDTO(savedInventory);
    }

    @Override
    public InventoryDTO releaseReservation(String id, Double quantity) {
        log.info("Releasing reservation {} for inventory: {}", quantity, id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        if (inventory.getQuantityReserved() < quantity) {
            throw new IllegalStateException(
                    "Cannot release more than reserved. Reserved: " + inventory.getQuantityReserved());
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - quantity);

        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Released {} units. Total reserved: {}", quantity, savedInventory.getQuantityReserved());

        publishInventoryEvent(savedInventory, "RELEASED");

        return mapToDTO(savedInventory);
    }

    @Override
    public InventoryDTO transferInventory(InventoryTransferRequest request) {
        log.info("Transferring {} units of item {} from {} to {}",
                request.getQuantity(), request.getItemId(),
                request.getFromLocationId(), request.getToLocationId());

        // Reduce from source
        Inventory fromInventory = inventoryRepository
                .findByItemIdAndLocationId(request.getItemId(), request.getFromLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Source inventory not found"));

        if (fromInventory.getAvailableQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock at source location");
        }

        fromInventory.setQuantityOnHand(fromInventory.getQuantityOnHand() - request.getQuantity());
        fromInventory.setLastMovementAt(LocalDateTime.now());
        inventoryRepository.save(fromInventory);

        // Add to destination
        Inventory toInventory = inventoryRepository
                .findByItemIdAndLocationId(request.getItemId(), request.getToLocationId())
                .orElseGet(() -> Inventory.builder()
                        .itemId(request.getItemId())
                        .warehouseId(request.getToWarehouseId())
                        .locationId(request.getToLocationId())
                        .quantityOnHand(0.0)
                        .quantityReserved(0.0)
                        .quantityDamaged(0.0)
                        .status(InventoryStatus.AVAILABLE)
                        .uom(fromInventory.getUom())
                        .build());

        toInventory.setQuantityOnHand(toInventory.getQuantityOnHand() + request.getQuantity());
        toInventory.setLastMovementAt(LocalDateTime.now());
        Inventory savedInventory = inventoryRepository.save(toInventory);

        publishInventoryEvent(savedInventory, "TRANSFERRED");

        return mapToDTO(savedInventory);
    }

    @Override
    public InventoryDTO updateInventory(String id, InventoryUpdateRequest request) {
        log.info("Updating inventory with ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        if (request.getStatus() != null) {
            inventory.setStatus(request.getStatus());
        }
        if (request.getCost() != null) {
            inventory.setCost(request.getCost());
        }
        if (request.getExpiryDate() != null) {
            inventory.setExpiryDate(request.getExpiryDate());
        }
        if (request.getAttributes() != null) {
            inventory.setAttributes(request.getAttributes());
        }

        Inventory savedInventory = inventoryRepository.save(inventory);

        publishInventoryEvent(savedInventory, "UPDATED");

        return mapToDTO(savedInventory);
    }

    @Override
    public void deleteInventory(String id) {
        log.info("Deleting inventory with ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        inventoryRepository.delete(inventory);

        publishInventoryEvent(inventory, "DELETED");
    }

    // ========== ENRICHED RESPONSES (WITH ITEM FROM CACHE) ==========

    @Override
    @Transactional(readOnly = true)
    public InventoryWithItemDTO getInventoryWithItem(String id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        ItemCacheDTO item = itemCacheService.getItem(inventory.getItemId());

        return mapToEnrichedDTO(inventory, item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryWithItemDTO> getInventoriesWithItemByLocation(String locationId) {
        return inventoryRepository.findByLocationId(locationId).stream()
                .map(inv -> {
                    ItemCacheDTO item = itemCacheService.getItem(inv.getItemId());
                    return mapToEnrichedDTO(inv, item);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryWithItemDTO> getInventoriesWithItemByWarehouse(String warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(inv -> {
                    ItemCacheDTO item = itemCacheService.getItem(inv.getItemId());
                    return mapToEnrichedDTO(inv, item);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkStockAvailability(String itemId, String locationId, Double quantity) {
        return inventoryRepository.findByItemIdAndLocationId(itemId, locationId)
                .map(inv -> inv.getAvailableQuantity() >= quantity)
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAvailableQuantity(String itemId, String locationId) {
        return inventoryRepository.findByItemIdAndLocationId(itemId, locationId)
                .map(Inventory::getAvailableQuantity)
                .orElse(0.0);
    }

    // ========== HELPER METHODS ==========

    private void publishInventoryEvent(Inventory inventory, String eventType) {
        InventoryEvent event = InventoryEvent.builder()
                .inventoryId(inventory.getId())
                .itemId(inventory.getItemId())
                .locationId(inventory.getLocationId())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .eventType(eventType)
                .timestamp(LocalDateTime.now())
                .build();

        eventPublisher.publishInventoryEvent(event);
    }

    private InventoryDTO mapToDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .itemId(inventory.getItemId())
                .warehouseId(inventory.getWarehouseId())
                .locationId(inventory.getLocationId())
                .lotId(inventory.getLotId())
                .serialId(inventory.getSerialId())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .quantityDamaged(inventory.getQuantityDamaged())
                .availableQuantity(inventory.getAvailableQuantity())
                .uom(inventory.getUom())
                .status(inventory.getStatus())
                .cost(inventory.getCost())
                .expiryDate(inventory.getExpiryDate())
                .manufactureDate(inventory.getManufactureDate())
                .lastMovementAt(inventory.getLastMovementAt())
                .lastReconciliationAt(inventory.getLastReconciliationAt())
                .attributes(inventory.getAttributes())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    private InventoryWithItemDTO mapToEnrichedDTO(Inventory inventory, ItemCacheDTO item) {
        return InventoryWithItemDTO.builder()
                .id(inventory.getId())
                .itemId(inventory.getItemId())
                .warehouseId(inventory.getWarehouseId())
                .locationId(inventory.getLocationId())
                .lotId(inventory.getLotId())
                .serialId(inventory.getSerialId())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .quantityDamaged(inventory.getQuantityDamaged())
                .availableQuantity(inventory.getAvailableQuantity())
                .uom(inventory.getUom())
                .status(inventory.getStatus())
                .cost(inventory.getCost())
                .expiryDate(inventory.getExpiryDate())
                .manufactureDate(inventory.getManufactureDate())
                .lastMovementAt(inventory.getLastMovementAt())
                .lastReconciliationAt(inventory.getLastReconciliationAt())
                .attributes(inventory.getAttributes())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .item(item)
                .build();
    }
}
