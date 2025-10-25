package com.stock.inventoryservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotDTO {
    private String id;
    private String code;
    private String itemId;
    private LocalDateTime mfgDate;
    private LocalDateTime expiryDate;
    private String supplierId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}