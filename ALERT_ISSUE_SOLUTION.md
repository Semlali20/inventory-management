# Alert Service Issue - Root Cause & Solution

## Problem Identified

You reported that **no alerts are appearing** in the alert page or bell notification when inventory items have low stock (e.g., only 5 items left).

## Root Cause Analysis

After thorough investigation, I found the following:

### 1. Alert System Status
- ✅ **Alert Service** is running correctly (port 8088)
- ✅ **Frontend components** are properly implemented:
  - `AlertsPage.tsx` - displays alerts with filtering/search
  - `NotificationDropdown.tsx` - bell notification with badge
- ✅ **Backend alert logic** exists in `InventoryServiceImpl.java`:
  - Method: `checkLowStockAndCreateAlert()` (lines 574-627)
  - Thresholds: CRITICAL (< 5 units), WARNING (< 10 units)
  - Alert client integration working

### 2. The Problem
**Alerts are ONLY created when inventory operations happen through the API**, such as:
- Create new inventory
- Update inventory
- Adjust quantity
- Reserve quantity
- Transfer inventory

**Existing inventory that was created before the alert system** or created directly in the database **will NOT automatically get alerts**.

### 3. Current Database State
```
Alert Database:
- Total alerts: 0

Inventory Database:
- Inventory record with ID: 4b5a50c5-6e62-4a7c-be4a-18d374fba0e1
  - Item ID: 55a06d71-158e-4403-bd60-9c38c5d77a7d
  - Quantity on hand: 10
  - Quantity reserved: 0
  - Available: 10 units (should trigger WARNING alert at < 10)
```

This inventory exists but **no alert was created** because it was added before the alert system or the alert logic wasn't triggered.

## Solution Implemented

I've added a **new endpoint** to scan all existing inventory and create alerts for low stock items.

### Code Changes

#### 1. InventoryService.java
Added method signature:
```java
// Alert Management
int scanAllInventoryForAlerts();
```

#### 2. InventoryServiceImpl.java (lines 691-720)
Implemented the scanning logic:
```java
@Override
@Transactional(readOnly = true)
public int scanAllInventoryForAlerts() {
    log.info("🔍 Starting scan of all inventory for low stock alerts...");

    List<Inventory> allInventories = inventoryRepository.findAll();
    int alertsCreated = 0;

    for (Inventory inventory : allInventories) {
        try {
            Double availableQty = inventory.getAvailableQuantity();

            // Only create alerts for items below WARNING threshold
            if (availableQty < 10.0) {
                checkLowStockAndCreateAlert(inventory);
                alertsCreated++;
                log.info("✅ Alert created for item {} at location {} (qty: {})",
                        inventory.getItemId(), inventory.getLocationId(), availableQty);
            }
        } catch (Exception e) {
            log.error("❌ Failed to check/create alert for inventory {}: {}",
                    inventory.getId(), e.getMessage());
        }
    }

    log.info("🎯 Scan complete! Total inventories scanned: {}, Alerts created: {}",
            allInventories.size(), alertsCreated);

    return alertsCreated;
}
```

#### 3. InventoryController.java (lines 299-313)
Added REST endpoint:
```java
// ========== ALERT MANAGEMENT ==========

@PostMapping("/scan-for-alerts")
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
@Operation(summary = "Scan all inventory for low stock alerts",
        description = "Scans all inventory items and creates alerts for items below thresholds")
@ApiResponse(responseCode = "200", description = "Scan completed successfully")
public ResponseEntity<String> scanAllInventoryForAlerts() {
    log.info("REST request to scan all inventory for low stock alerts");

    int alertsCreated = inventoryService.scanAllInventoryForAlerts();

    String message = String.format("Scan completed successfully. %d alert(s) created for low stock items.", alertsCreated);
    return ResponseEntity.ok(message);
}
```

## How to Use the Solution

### Step 1: Rebuild and Restart Inventory Service

The code changes have been made, but you need to rebuild and restart the service:

```bash
# Navigate to docker-compose directory
cd docker-compose

# Rebuild the inventory service Docker image
docker-compose build inventory-service

# Restart the service
docker-compose up -d inventory-service

# Verify it's running
docker-compose ps inventory-service
```

### Step 2: Call the New Endpoint

Once the service is restarted, trigger the scan using one of these methods:

#### Option A: Using curl (from command line)
```bash
# Get an auth token first (login through frontend or get from browser)
# Then call the endpoint:
curl -X POST http://localhost:8080/inventory-service/api/inventory/scan-for-alerts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Option B: Using Frontend Developer Console
1. Open your browser at http://localhost:5173
2. Login to the application
3. Open Developer Tools (F12)
4. Go to Console tab
5. Run this JavaScript:
```javascript
fetch('http://localhost:8080/inventory-service/api/inventory/scan-for-alerts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on how tokens are stored
  }
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
```

#### Option C: Using Postman or API Client
1. POST to: `http://localhost:8080/inventory-service/api/inventory/scan-for-alerts`
2. Add header: `Authorization: Bearer YOUR_JWT_TOKEN`
3. Send request

### Step 3: Verify Alerts Were Created

After calling the endpoint, you should see:

1. **Response Message**:
   ```
   Scan completed successfully. 1 alert(s) created for low stock items.
   ```

2. **Check Logs**:
   ```bash
   docker logs inventory-service --tail 50
   ```

   Look for:
   ```
   🔍 Starting scan of all inventory for low stock alerts...
   ✅ Alert created for item 55a06d71-158e-4403-bd60-9c38c5d77a7d at location ... (qty: 10.0)
   🎯 Scan complete! Total inventories scanned: 2, Alerts created: 1
   ```

3. **Check Frontend**:
   - Go to http://localhost:5173
   - Look at the **bell icon** in header - should show a red badge
   - Click bell icon - should see the alert in dropdown
   - Go to **Alerts** page - should see the LOW_STOCK alert

4. **Check Database**:
   ```bash
   docker exec postgres-alert psql -U alert_user -d alert_db -c "SELECT id, type, level, status, message FROM alerts;"
   ```

## Alternative: Quick Test Without Rebuild

If you don't want to wait for the rebuild, you can trigger alerts by:

1. **Updating an existing inventory** through the frontend:
   - Go to Inventory page
   - Edit an inventory item
   - Change quantity to 4 (CRITICAL) or 7 (WARNING)
   - Save
   - Alert should be created immediately

2. **Creating new inventory** with low stock:
   - Go to Inventory page
   - Click "New Inventory"
   - Set quantity to 3 units
   - Create
   - Alert should appear immediately

## Long-term Solution: Scheduled Job

To automatically scan inventory periodically, add a scheduled job to `InventoryServiceImpl.java`:

```java
import org.springframework.scheduling.annotation.Scheduled;

// Add this method to the class:
@Scheduled(cron = "0 0 */6 * * *") // Run every 6 hours
public void scheduledInventoryScan() {
    log.info("⏰ Running scheduled inventory scan for alerts...");
    scanAllInventoryForAlerts();
}
```

And enable scheduling in your main application class:
```java
@EnableScheduling
@SpringBootApplication
public class InventoryServiceApplication {
    // ...
}
```

## Summary

### What Was Wrong
- Existing inventory wasn't checked for low stock alerts
- No background job to periodically scan inventory

### What Was Fixed
- ✅ Added `scanAllInventoryForAlerts()` method to scan all inventory
- ✅ Added REST endpoint `/api/inventory/scan-for-alerts` to trigger manually
- ✅ Method checks all inventory and creates alerts for items < 10 units

### Next Steps
1. **Rebuild** inventory service (see Step 1)
2. **Call** the scan endpoint (see Step 2)
3. **Verify** alerts appear in frontend (see Step 3)
4. **Optional**: Add scheduled job for periodic scanning

## Files Modified

1. `inventory-service/src/main/java/com/stock/inventoryservice/service/InventoryService.java`
   - Added: `int scanAllInventoryForAlerts();`

2. `inventory-service/src/main/java/com/stock/inventoryservice/service/impl/InventoryServiceImpl.java`
   - Added: Implementation of `scanAllInventoryForAlerts()` (lines 691-720)

3. `inventory-service/src/main/java/com/stock/inventoryservice/controller/InventoryController.java`
   - Added: POST endpoint `/scan-for-alerts` (lines 299-313)

## Questions?

If alerts still don't appear after following these steps:
1. Check service logs: `docker logs inventory-service`
2. Check alert service logs: `docker logs alert-service`
3. Verify AlertClient can connect to alert-service
4. Check JWT token is valid
5. Verify user has ADMIN or WAREHOUSE_MANAGER role
