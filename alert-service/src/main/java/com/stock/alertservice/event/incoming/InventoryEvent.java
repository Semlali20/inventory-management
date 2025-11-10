package com.stock.alertservice.event.incoming;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEvent {
    private String inventoryId;
    private String itemId;
    private String locationId;
    private Double quantity;
    private Double previousQuantity;
    private String status;
    private Double minThreshold;
    private Double maxThreshold;
    private LocalDateTime timestamp;
    private String eventType;
    private Boolean thresholdViolated;
    private String violationType;
}
