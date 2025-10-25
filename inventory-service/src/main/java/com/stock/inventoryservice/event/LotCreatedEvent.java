package com.stock.inventoryservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotCreatedEvent {
    private String lotId;
    private String code;
    private String itemId;
    private LocalDateTime mfgDate;
    private LocalDateTime expiryDate;
    private String supplierId;
    private LocalDateTime timestamp;
}