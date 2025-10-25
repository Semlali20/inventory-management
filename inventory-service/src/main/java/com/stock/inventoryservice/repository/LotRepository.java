package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, String> {

    Optional<Lot> findByCode(String code);

    List<Lot> findByItemId(String itemId);

    List<Lot> findBySupplierId(String supplierId);

    boolean existsByCode(String code);

    @Query("SELECT l FROM Lot l WHERE l.expiryDate BETWEEN :startDate AND :endDate")
    List<Lot> findByExpiryDateBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT l FROM Lot l WHERE l.expiryDate < :date")
    List<Lot> findExpiredLots(@Param("date") LocalDateTime date);

    @Query("SELECT l FROM Lot l WHERE l.itemId = :itemId AND l.expiryDate > :date ORDER BY l.expiryDate ASC")
    List<Lot> findActiveLotsForItem(
            @Param("itemId") String itemId,
            @Param("date") LocalDateTime date
    );
}