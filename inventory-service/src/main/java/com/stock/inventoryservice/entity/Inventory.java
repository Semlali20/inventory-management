package com.stock.inventoryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Version // ⚠️ CRITICAL for concurrency control
    private Long version;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "warehouse_id", nullable = false)
    private String warehouseId; // From Location Service

    @Column(name = "location_id", nullable = false)
    private String locationId; // From Location Service (Zone-Aisle-Rack-Level-Bin)

    @Column(name = "lot_id")
    private String lotId; // Nullable - only for lot-tracked items

    @Column(name = "serial_id")
    private String serialId; // Nullable - only for serialised items

    // Quantities
    @Column(name = "quantity_on_hand", nullable = false)
    private Double quantityOnHand = 0.0;

    @Column(name = "quantity_reserved", nullable = false)
    private Double quantityReserved = 0.0;

    @Column(name = "quantity_damaged")
    private Double quantityDamaged = 0.0;

    @Column(length = 20)
    private String uom; // Unit of Measure (EA, KG, L, etc.)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InventoryStatus status;

    @Column(precision = 19, scale = 4)
    private BigDecimal cost; // Cost per unit

    @Column(name = "expiry_date")
    private LocalDate expiryDate; // For perishable items

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "last_movement_at")
    private LocalDateTime lastMovementAt;

    @Column(name = "last_reconciliation_at")
    private LocalDateTime lastReconciliationAt;

    @Column(columnDefinition = "TEXT")
    private String attributes; // JSON for custom fields

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    /**
     * Calculated field: Available quantity = On Hand - Reserved
     */
    @Transient
    public Double getAvailableQuantity() {
        return quantityOnHand - quantityReserved;
    }

    /**
     * Check if inventory has sufficient available quantity
     */
    @Transient
    public boolean hasSufficientStock(Double required) {
        return getAvailableQuantity() >= required;
    }
}