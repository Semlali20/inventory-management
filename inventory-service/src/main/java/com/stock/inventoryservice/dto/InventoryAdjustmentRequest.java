package com.stock.inventoryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAdjustmentRequest {
    @NotNull(message = "Quantity change is required")
    private BigDecimal quantityChange;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String notes;
}