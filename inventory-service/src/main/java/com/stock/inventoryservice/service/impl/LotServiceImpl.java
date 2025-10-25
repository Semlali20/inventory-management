package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.dto.LotDTO;
import com.stock.inventoryservice.entity.Lot;
import com.stock.inventoryservice.event.EventPublisher;
import com.stock.inventoryservice.event.LotCreatedEvent;
import com.stock.inventoryservice.exception.DuplicateResourceException;
import com.stock.inventoryservice.exception.ResourceNotFoundException;
import com.stock.inventoryservice.repository.LotRepository;
import com.stock.inventoryservice.service.LotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LotServiceImpl implements LotService {

    private final LotRepository lotRepository;
    private final EventPublisher eventPublisher;

    @Override
    public LotDTO createLot(Lot lot) {
        log.info("Creating lot with code: {}", lot.getCode());

        if (lotRepository.existsByCode(lot.getCode())) {
            throw new DuplicateResourceException("Lot with code " + lot.getCode() + " already exists");
        }

        Lot savedLot = lotRepository.save(lot);
        log.info("Lot created successfully with ID: {}", savedLot.getId());

        // Publish event
        LotCreatedEvent event = LotCreatedEvent.builder()
                .lotId(savedLot.getId())
                .code(savedLot.getCode())
                .itemId(savedLot.getItemId())
                .mfgDate(savedLot.getMfgDate())
                .expiryDate(savedLot.getExpiryDate())
                .supplierId(savedLot.getSupplierId())
                .timestamp(LocalDateTime.now())
                .build();

        eventPublisher.publishLotCreated(event);

        return mapToDTO(savedLot);
    }

    @Override
    @Transactional(readOnly = true)
    public LotDTO getLotById(String id) {
        log.info("Fetching lot with ID: {}", id);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        return mapToDTO(lot);
    }

    @Override
    @Transactional(readOnly = true)
    public LotDTO getLotByCode(String code) {
        log.info("Fetching lot with code: {}", code);

        Lot lot = lotRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with code: " + code));

        return mapToDTO(lot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getAllLots() {
        log.info("Fetching all lots");

        return lotRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsByItemId(String itemId) {
        log.info("Fetching lots for item ID: {}", itemId);

        return lotRepository.findByItemId(itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsBySupplierId(String supplierId) {
        log.info("Fetching lots for supplier ID: {}", supplierId);

        return lotRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getExpiredLots() {
        log.info("Fetching expired lots");

        return lotRepository.findExpiredLots(LocalDateTime.now()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getLotsExpiringBetween(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching lots expiring between {} and {}", startDate, endDate);

        return lotRepository.findByExpiryDateBetween(startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LotDTO> getActiveLotsForItem(String itemId) {
        log.info("Fetching active lots for item ID: {}", itemId);

        return lotRepository.findActiveLotsForItem(itemId, LocalDateTime.now()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LotDTO updateLot(String id, Lot lotUpdate) {
        log.info("Updating lot with ID: {}", id);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        // Check if code is being changed and if it already exists
        if (!lot.getCode().equals(lotUpdate.getCode()) && lotRepository.existsByCode(lotUpdate.getCode())) {
            throw new DuplicateResourceException("Lot with code " + lotUpdate.getCode() + " already exists");
        }

        lot.setCode(lotUpdate.getCode());
        lot.setItemId(lotUpdate.getItemId());
        lot.setMfgDate(lotUpdate.getMfgDate());
        lot.setExpiryDate(lotUpdate.getExpiryDate());
        lot.setSupplierId(lotUpdate.getSupplierId());

        Lot updatedLot = lotRepository.save(lot);
        log.info("Lot updated successfully with ID: {}", updatedLot.getId());

        return mapToDTO(updatedLot);
    }

    @Override
    public void deleteLot(String id) {
        log.info("Deleting lot with ID: {}", id);

        Lot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found with ID: " + id));

        lotRepository.delete(lot);
        log.info("Lot deleted successfully with ID: {}", id);
    }

    private LotDTO mapToDTO(Lot lot) {
        return LotDTO.builder()
                .id(lot.getId())
                .code(lot.getCode())
                .itemId(lot.getItemId())
                .mfgDate(lot.getMfgDate())
                .expiryDate(lot.getExpiryDate())
                .supplierId(lot.getSupplierId())
                .createdAt(lot.getCreatedAt())
                .updatedAt(lot.getUpdatedAt())
                .build();
    }
}