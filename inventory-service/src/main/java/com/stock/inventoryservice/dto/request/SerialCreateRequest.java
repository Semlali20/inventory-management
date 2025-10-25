package com.stock.inventoryservice.dto.request;

import com.stock.inventoryservice.entity.SerialStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerialCreateRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number must be 100 characters or less")
    private String serialNumber;

    @NotNull(message = "Status is required")
    private SerialStatus status;

    private String locationId;
}
