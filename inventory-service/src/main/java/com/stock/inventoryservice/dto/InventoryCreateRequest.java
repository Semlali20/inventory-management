package com.stock.inventoryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCreateRequest {
    @NotBlank(message = "Item variant ID is required")
    private String itemVariantId;

    @NotBlank(message = "Location ID is required")
    private String locationId;

    @NotNull(message = "Quantity on hand is required")
    @PositiveOrZero(message = "Quantity on hand must be zero or positive")
    private BigDecimal quantityOnHand;

    @PositiveOrZero(message = "Quantity reserved must be zero or positive")
    private BigDecimal quantityReserved;

    @PositiveOrZero(message = "Quantity in transit must be zero or positive")
    private BigDecimal quantityInTransit;

    private String lotNumber;
    private String serialNumber;
    private LocalDateTime expirationDate;
    private LocalDateTime manufactureDate;
    private String status;
}