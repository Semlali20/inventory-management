package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Serial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerialRepository extends JpaRepository<Serial, String> {

    Optional<Serial> findByCode(String code);

    List<Serial> findByItemId(String itemId);

    List<Serial> findByLotId(String lotId);

    List<Serial> findByStatus(String status);

    boolean existsByCode(String code);

    @Query("SELECT s FROM Serial s WHERE s.itemId = :itemId AND s.status = :status")
    List<Serial> findByItemIdAndStatus(
            @Param("itemId") String itemId,
            @Param("status") String status
    );

    @Query("SELECT COUNT(s) FROM Serial s WHERE s.lotId = :lotId")
    Long countByLotId(@Param("lotId") String lotId);

    @Query("SELECT s FROM Serial s WHERE s.lotId = :lotId AND s.status = :status")
    List<Serial> findByLotIdAndStatus(
            @Param("lotId") String lotId,
            @Param("status") String status
    );
}