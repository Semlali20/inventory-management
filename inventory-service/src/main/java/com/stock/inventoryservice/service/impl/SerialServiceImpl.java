package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.dto.SerialDTO;
import com.stock.inventoryservice.entity.Serial;
import com.stock.inventoryservice.entity.SerialStatus;
import com.stock.inventoryservice.exception.DuplicateResourceException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.SerialRepository;
import com.stock.inventoryservice.service.SerialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SerialServiceImpl implements SerialService {

    private final SerialRepository serialRepository;

    @Override
    public SerialDTO createSerial(Serial serial) {
        log.info("Creating serial with code: {}", serial.getCode());

        if (serialRepository.existsByCode(serial.getCode())) {
            throw new DuplicateResourceException("Serial with code " + serial.getCode() + " already exists");
        }

        Serial savedSerial = serialRepository.save(serial);
        log.info("Serial created successfully with ID: {}", savedSerial.getId());

        return mapToDTO(savedSerial);
    }

    @Override
    @Transactional(readOnly = true)
    public SerialDTO getSerialById(String id) {
        log.info("Fetching serial with ID: {}", id);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        return mapToDTO(serial);
    }

    @Override
    @Transactional(readOnly = true)
    public SerialDTO getSerialByCode(String code) {
        log.info("Fetching serial with code: {}", code);

        Serial serial = serialRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with code: " + code));

        return mapToDTO(serial);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getAllSerials() {
        log.info("Fetching all serials");

        return serialRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByItemId(String itemId) {
        log.info("Fetching serials for item ID: {}", itemId);

        return serialRepository.findByItemId(itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByLotId(String lotId) {
        log.info("Fetching serials for lot ID: {}", lotId);

        return serialRepository.findByLotId(lotId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByStatus(String status) {
        log.info("Fetching serials with status: {}", status);

        return serialRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SerialDTO> getSerialsByItemIdAndStatus(String itemId, String status) {
        log.info("Fetching serials for item ID: {} with status: {}", itemId, status);

        return serialRepository.findByItemIdAndStatus(itemId, status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SerialDTO updateSerial(String id, Serial serialUpdate) {
        log.info("Updating serial with ID: {}", id);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        // Check if code is being changed and if it already exists
        if (!serial.getCode().equals(serialUpdate.getCode()) && serialRepository.existsByCode(serialUpdate.getCode())) {
            throw new DuplicateResourceException("Serial with code " + serialUpdate.getCode() + " already exists");
        }

        serial.setCode(serialUpdate.getCode());
        serial.setItemId(serialUpdate.getItemId());
        serial.setId(serialUpdate.getId());
        serial.setStatus(serialUpdate.getStatus());

        Serial updatedSerial = serialRepository.save(serial);
        log.info("Serial updated successfully with ID: {}", updatedSerial.getId());

        return mapToDTO(updatedSerial);
    }

    @Override
    public SerialDTO updateSerialStatus(String id, String status) {
        log.info("Updating status for serial ID: {} to {}", id, status);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        serial.setStatus(SerialStatus.valueOf(status));
        Serial updatedSerial = serialRepository.save(serial);

        log.info("Serial status updated successfully");

        return mapToDTO(updatedSerial);
    }

    @Override
    public void deleteSerial(String id) {
        log.info("Deleting serial with ID: {}", id);

        Serial serial = serialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serial not found with ID: " + id));

        serialRepository.delete(serial);
        log.info("Serial deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countSerialsByLot(String lotId) {
        log.info("Counting serials for lot ID: {}", lotId);

        return serialRepository.countByLotId(lotId);
    }

    private SerialDTO mapToDTO(Serial serial) {
        return SerialDTO.builder()
                .id(serial.getId())
                .code(serial.getCode())
                .itemId(serial.getItemId())
                .lotId(serial.getId())
                .status(serial.getStatus())
                .createdAt(serial.getCreatedAt())
                .updatedAt(serial.getUpdatedAt())
                .build();
    }
}