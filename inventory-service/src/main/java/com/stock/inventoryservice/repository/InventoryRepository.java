package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {

    Optional<Inventory> findByItemIdAndLocationId(String itemId, String locationId);

    List<Inventory> findByItemId(String itemId);

    List<Inventory> findByLocationId(String locationId);

    List<Inventory> findByLotId(String lotId);

    List<Inventory> findBySerialId(String serialId);

    @Query("SELECT i FROM Inventory i WHERE i.itemId = :itemId AND i.locationId = :locationId AND i.lotId = :lotId")
    Optional<Inventory> findByItemLocationAndLot(
            @Param("itemId") String itemId,
            @Param("locationId") String locationId,
            @Param("lotId") String lotId
    );

    @Query("SELECT SUM(i.quantityOnHand) FROM Inventory i WHERE i.itemId = :itemId")
    BigDecimal getTotalQuantityByItem(@Param("itemId") String itemId);

    @Query("SELECT i FROM Inventory i WHERE i.quantityOnHand < :threshold")
    List<Inventory> findLowStockInventories(@Param("threshold") BigDecimal threshold);
}