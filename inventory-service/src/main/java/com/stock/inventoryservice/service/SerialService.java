package com.stock.inventoryservice.service;

import com.stock.inventoryservice.dto.SerialDTO;
import com.stock.inventoryservice.entity.Serial;

import java.util.List;

public interface SerialService {

    SerialDTO createSerial(Serial serial);

    SerialDTO getSerialById(String id);

    SerialDTO getSerialByCode(String code);

    List<SerialDTO> getAllSerials();

    List<SerialDTO> getSerialsByItemId(String itemId);

    List<SerialDTO> getSerialsByLotId(String lotId);

    List<SerialDTO> getSerialsByStatus(String status);

    List<SerialDTO> getSerialsByItemIdAndStatus(String itemId, String status);

    SerialDTO updateSerial(String id, Serial serial);

    SerialDTO updateSerialStatus(String id, String status);

    void deleteSerial(String id);

    Long countSerialsByLot(String lotId);
}