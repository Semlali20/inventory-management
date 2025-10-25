package com.stock.inventoryservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {
    private String id;
    private String itemVariantId;
    private String itemName;
    private String variantName;
    private String locationId;
    private String locationCode;
    private String warehouseId;
    private String warehouseName;
    private BigDecimal quantityOnHand;
    private BigDecimal quantityReserved;
    private BigDecimal quantityAvailable;
    private BigDecimal quantityInTransit;
    private String lotNumber;
    private String serialNumber;
    private LocalDateTime expirationDate;
    private LocalDateTime manufactureDate;
    private String status;
    private LocalDateTime lastCountDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}