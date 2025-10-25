package com.stock.inventoryservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SerialDTO {
    private String id;
    private String code;
    private String itemId;
    private String lotId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}