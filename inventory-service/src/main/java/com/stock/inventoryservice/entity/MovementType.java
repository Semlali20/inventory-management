package com.stock.inventoryservice.entity;

public enum MovementType {
    RECEIPT,        // Receiving goods
    PUTAWAY,        // Moving to storage location
    TRANSFER,       // Location-to-location transfer
    PICK,           // Picking for order
    PACK,           // Packing operation
    SHIP,           // Shipping out
    ADJUSTMENT,     // Manual adjustment
    CYCLE_COUNT,    // Physical count adjustment
    RETURN,         // Customer return
    DAMAGE,         // Mark as damaged
    SCRAP,          // Disposal
    QUARANTINE,     // Move to quarantine
    RELEASE         // Release from quarantine
}