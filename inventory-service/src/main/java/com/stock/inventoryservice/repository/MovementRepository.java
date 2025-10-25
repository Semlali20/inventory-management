package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Movement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovementRepository extends JpaRepository<Movement, String> {

    List<Movement> findByInventoryId(String inventoryId);

    List<Movement> findByItemId(String itemId);

    List<Movement> findByLocationId(String locationId);

    List<Movement> findByMovementType(String movementType);

    @Query("SELECT m FROM Movement m WHERE m.createdAt BETWEEN :startDate AND :endDate")
    List<Movement> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT m FROM Movement m WHERE m.itemId = :itemId AND m.createdAt BETWEEN :startDate AND :endDate")
    List<Movement> findByItemIdAndDateRange(
            @Param("itemId") String itemId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT m FROM Movement m WHERE m.locationId = :locationId ORDER BY m.createdAt DESC")
    List<Movement> findByLocationIdOrderByDateDesc(@Param("locationId") String locationId);
}