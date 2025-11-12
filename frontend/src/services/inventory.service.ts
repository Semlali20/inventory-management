import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import { Inventory, Lot, Serial, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';

export const inventoryService = {
  // Inventory
  getInventory: async (params?: PaginationParams): Promise<PaginatedResponse<Inventory>> => {
    const response = await apiClient.get<PaginatedResponse<Inventory>>(API_ENDPOINTS.INVENTORY.INVENTORY, { params });
    return response.data;
  },

  getInventoryById: async (id: string): Promise<Inventory> => {
    const response = await apiClient.get<Inventory>(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id));
    return response.data;
  },

  updateInventory: async (id: string, data: Partial<Inventory>): Promise<ApiResponse<Inventory>> => {
    const response = await apiClient.put<ApiResponse<Inventory>>(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id), data);
    return response.data;
  },

  // Lots
  getLots: async (params?: PaginationParams): Promise<PaginatedResponse<Lot>> => {
    const response = await apiClient.get<PaginatedResponse<Lot>>(API_ENDPOINTS.INVENTORY.LOTS, { params });
    return response.data;
  },

  getLotById: async (id: string): Promise<Lot> => {
    const response = await apiClient.get<Lot>(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id));
    return response.data;
  },

  createLot: async (data: Partial<Lot>): Promise<ApiResponse<Lot>> => {
    const response = await apiClient.post<ApiResponse<Lot>>(API_ENDPOINTS.INVENTORY.LOTS, data);
    return response.data;
  },

  updateLot: async (id: string, data: Partial<Lot>): Promise<ApiResponse<Lot>> => {
    const response = await apiClient.put<ApiResponse<Lot>>(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id), data);
    return response.data;
  },

  deleteLot: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id));
    return response.data;
  },

  // Serials
  getSerials: async (params?: PaginationParams): Promise<PaginatedResponse<Serial>> => {
    const response = await apiClient.get<PaginatedResponse<Serial>>(API_ENDPOINTS.INVENTORY.SERIALS, { params });
    return response.data;
  },

  getSerialById: async (id: string): Promise<Serial> => {
    const response = await apiClient.get<Serial>(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id));
    return response.data;
  },

  createSerial: async (data: Partial<Serial>): Promise<ApiResponse<Serial>> => {
    const response = await apiClient.post<ApiResponse<Serial>>(API_ENDPOINTS.INVENTORY.SERIALS, data);
    return response.data;
  },

  updateSerial: async (id: string, data: Partial<Serial>): Promise<ApiResponse<Serial>> => {
    const response = await apiClient.put<ApiResponse<Serial>>(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id), data);
    return response.data;
  },

  deleteSerial: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id));
    return response.data;
  },
};

