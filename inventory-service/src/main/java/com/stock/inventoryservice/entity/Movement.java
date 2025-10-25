package com.stock.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MovementType type;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "lot_id")
    private String lotId;

    @Column(name = "serial_id")
    private String serialId;

    @Column(name = "from_location_id")
    private String fromLocationId; // Nullable for receipts

    @Column(name = "to_location_id")
    private String toLocationId; // Nullable for shipments

    @Column(nullable = false)
    private Double quantity;

    @Column(length = 20)
    private String uom;

    @Column(precision = 19, scale = 4)
    private BigDecimal cost;

    @Column(name = "reference_type", length = 50)
    private String referenceType; // ORDER, TRANSFER, ADJUSTMENT, CYCLE_COUNT, etc.

    @Column(name = "reference_id", length = 100)
    private String referenceId; // External reference (order ID, transfer ID, etc.)

    @Column(length = 500)
    private String reason; // Reason for movement (especially for adjustments)

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "user_id")
    private String userId; // Who performed the movement

    @Column(name = "previous_quantity")
    private Double previousQuantity; // Quantity before movement

    @Column(name = "new_quantity")
    private Double newQuantity; // Quantity after movement

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Immutable timestamp

    // Lazy relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", insertable = false, updatable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", insertable = false, updatable = false)
    private Lot lot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id", insertable = false, updatable = false)
    private Serial serial;
}