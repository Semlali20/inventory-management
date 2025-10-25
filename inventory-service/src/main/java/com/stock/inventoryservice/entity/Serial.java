package com.stock.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Serial entity for individual unit tracking.
 * Provides full traceability for high-value or regulated items.
 */
@Entity
@Table(name = "serials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Serial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String code; // Business key

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SerialStatus status;

    @Column(name = "location_id")
    private String locationId; // Current location

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Lazy relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", insertable = false, updatable = false)
    private Item item;

}