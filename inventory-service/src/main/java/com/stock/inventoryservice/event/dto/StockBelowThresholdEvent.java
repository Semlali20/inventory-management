
package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockBelowThresholdEvent implements Serializable {

    private String itemId;
    private String locationId;
    private String warehouseId;
    private Double currentQuantity;
    private Double threshold;
    private String alertLevel; // WARNING, CRITICAL
    private LocalDateTime timestamp;
}
