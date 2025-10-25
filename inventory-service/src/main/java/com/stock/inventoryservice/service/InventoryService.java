package com.stock.inventoryservice.service;

import com.stock.inventoryservice.dto.InventoryDTO;
import com.stock.inventoryservice.entity.Inventory;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryService {

    InventoryDTO createInventory(Inventory inventory);

    InventoryDTO getInventoryById(String id);

    List<InventoryDTO> getAllInventories();

    List<InventoryDTO> getInventoriesByItemId(String itemId);

    List<InventoryDTO> getInventoriesByLocationId(String locationId);

    InventoryDTO getInventoryByItemAndLocation(String itemId, String locationId);

    InventoryDTO updateInventory(String id, Inventory inventory);

    void deleteInventory(String id);

    InventoryDTO adjustQuantity(String id, BigDecimal quantityChange, String reason);

    BigDecimal getTotalQuantityByItem(String itemId);

    List<InventoryDTO> getLowStockInventories(BigDecimal threshold);

    InventoryDTO transferStock(String fromInventoryId, String toLocationId, BigDecimal quantity);
}