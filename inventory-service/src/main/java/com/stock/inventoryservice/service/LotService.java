package com.stock.inventoryservice.service;

import com.stock.inventoryservice.dto.LotDTO;
import com.stock.inventoryservice.entity.Lot;

import java.time.LocalDateTime;
import java.util.List;

public interface LotService {

    LotDTO createLot(Lot lot);

    LotDTO getLotById(String id);

    LotDTO getLotByCode(String code);

    List<LotDTO> getAllLots();

    List<LotDTO> getLotsByItemId(String itemId);

    List<LotDTO> getLotsBySupplierId(String supplierId);

    List<LotDTO> getExpiredLots();

    List<LotDTO> getLotsExpiringBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<LotDTO> getActiveLotsForItem(String itemId);

    LotDTO updateLot(String id, Lot lot);

    void deleteLot(String id);
}