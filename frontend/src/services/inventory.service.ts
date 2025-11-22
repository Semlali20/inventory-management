// frontend/src/services/inventory.service.ts
import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';

export interface InventoryCreateRequest {
  itemId: string;
  warehouseId: string;
  locationId: string;
  lotId?: string | null;
  serialId?: string | null;
  quantityOnHand: number;
  quantityReserved?: number;
  quantityDamaged?: number;
  uom: string;
  status: string;
  unitCost?: number | null;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  attributes?: string | null;
}

export interface InventoryUpdateRequest {
  quantityOnHand?: number;
  quantityReserved?: number;
  quantityDamaged?: number;
  status?: string;
  unitCost?: number | null;
  expiryDate?: string | null;
  lastCountDate?: string | null;
  attributes?: string | null;
}

export interface LotCreateRequest {
  code: string;
  itemId: string;
  lotNumber: string;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  supplierId?: string | null;
  status: string;
  attributes?: string | null;
}

export interface LotUpdateRequest {
  lotNumber?: string;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  supplierId?: string | null;
  status?: string;
  attributes?: string | null;
}

export interface SerialCreateRequest {
  itemId: string;
  code: string;
  serialNumber: string;
  status: string;
  locationId?: string | null;
}

export interface SerialUpdateRequest {
  serialNumber?: string;
  locationId?: string | null;
  status?: string;
}

export const inventoryService = {
  // ========== INVENTORY OPERATIONS ==========
  
  // Get all inventories
  getAllInventories: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.INVENTORY);
    return response.data;
  },

  // Get inventory by ID
  getInventoryById: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id));
    return response.data;
  },

  // Create inventory
  createInventory: async (data: InventoryCreateRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.INVENTORY, data);
    return response.data;
  },

  // Update inventory
  updateInventory: async (id: string, data: InventoryUpdateRequest): Promise<any> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id), data);
    return response.data;
  },

  // Delete inventory
  deleteInventory: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id));
  },

  // Get inventories by item
  getInventoriesByItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/item/${itemId}`);
    return response.data;
  },

  // Get inventories by warehouse
  getInventoriesByWarehouse: async (warehouseId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/warehouse/${warehouseId}`);
    return response.data;
  },

  // Get inventories by location
  getInventoriesByLocation: async (locationId: string, targetLocationId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/location/${locationId}`);
    return response.data;
  },

  // Get low stock items
  getLowStockItems: async (threshold: number = 10): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/low-stock?threshold=${threshold}`);
    return response.data;
  },

  // Get expiring items
  getExpiringItems: async (daysFromNow: number = 30): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/expiring?daysFromNow=${daysFromNow}`);
    return response.data;
  },

  // ========== LOT OPERATIONS ==========
  
  // Get all lots
  getLots: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOTS);
    return response.data;
  },

  // Get lot by ID
  getLotById: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id));
    return response.data;
  },

  // Get lot by code
  getLotByCode: async (code: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.LOTS}/code/${code}`);
    return response.data;
  },

  // Create lot
  createLot: async (data: LotCreateRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.LOTS, data);
    return response.data;
  },

  // Update lot
  updateLot: async (id: string, data: LotUpdateRequest): Promise<any> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id), data);
    return response.data;
  },

  // Update lot status
  updateLotStatus: async (id: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.INVENTORY.LOT_BY_ID(id)}/status?status=${status}`);
    return response.data;
  },

  // Delete lot
  deleteLot: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id));
  },

  // Get lots by item
  getLotsByItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.LOTS}/item/${itemId}`);
    return response.data;
  },

  // Get lots by status
  getLotsByStatus: async (status: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.LOTS}/status/${status}`);
    return response.data;
  },

  // Get expired lots
  getExpiredLots: async (): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.LOTS}/expired`);
    return response.data;
  },

  // Get active lots for item
  getActiveLotsForItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.LOTS}/item/${itemId}/active`);
    return response.data;
  },

  // ========== SERIAL OPERATIONS ==========
  
  // Get all serials
  getSerials: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.SERIALS);
    return response.data;
  },

  // Get serial by ID
  getSerialById: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id));
    return response.data;
  },

  // Get serial by code
  getSerialByCode: async (code: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/code/${code}`);
    return response.data;
  },

  // Get serial by serial number
  getSerialBySerialNumber: async (serialNumber: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/number/${serialNumber}`);
    return response.data;
  },

  // Create serial
  createSerial: async (data: SerialCreateRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.SERIALS, data);
    return response.data;
  },

  // Update serial
  updateSerial: async (id: string, data: SerialUpdateRequest): Promise<any> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id), data);
    return response.data;
  },

  // Update serial status
  updateSerialStatus: async (id: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id)}/status?status=${status}`);
    return response.data;
  },

  // Update serial location
  updateSerialLocation: async (id: string, locationId: string): Promise<any> => {
    const response = await apiClient.patch(`${API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id)}/location?locationId=${locationId}`);
    return response.data;
  },

  // Delete serial
  deleteSerial: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id));
  },

  // Get serials by item
  getSerialsByItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/item/${itemId}`);
    return response.data;
  },

  // Get serials by lot
  getSerialsByLot: async (lotId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/lot/${lotId}`);
    return response.data;
  },

  // Get serials by location
  getSerialsByLocation: async (locationId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/location/${locationId}`);
    return response.data;
  },

  // Get serials by status
  getSerialsByStatus: async (status: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/status/${status}`);
    return response.data;
  },

  // Get available serials for item
  getAvailableSerials: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/item/${itemId}/available`);
    return response.data;
  },

  // Check if serial is available
  isSerialAvailable: async (serialNumber: string): Promise<boolean> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/number/${serialNumber}/available`);
    return response.data;
  },
};