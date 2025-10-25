package com.stock.inventoryservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockBelowThresholdEvent {
    private String itemId;
    private String locationId;
    private BigDecimal currentQuantity;
    private BigDecimal minThreshold;
    private String alertLevel; // WARNING, CRITICAL
    private LocalDateTime timestamp;
}