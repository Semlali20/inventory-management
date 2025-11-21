// src/services/movement.service.ts
// ✅ COMPLETE VERSION - All Backend Endpoints Included

import { apiClient } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/constants';
import { Movement, MovementLine, MovementTask, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';
import { storage } from '@/utils/storage';

export const movementService = {
  // ========================================
  // MOVEMENTS
  // ========================================

  getMovements: async (params?: PaginationParams): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(API_ENDPOINTS.MOVEMENTS.MOVEMENTS, { params });
    return response.data;
  },

  getMovementById: async (id: string): Promise<Movement> => {
    const response = await apiClient.get<Movement>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id));
    return response.data;
  },

  createMovement: async (data: Partial<Movement>): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENTS, 
      data,
      { headers }
    );
    return response.data;
  },

  updateMovement: async (id: string, data: Partial<Movement>): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.put<ApiResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id), 
      data,
      { headers }
    );
    return response.data;
  },

  deleteMovement: async (id: string): Promise<ApiResponse<void>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id),
      { headers }
    );
    return response.data;
  },

  startMovement: async (id: string): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/start`,
      {},
      { headers }
    );
    return response.data;
  },

  completeMovement: async (id: string): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/complete`,
      {},
      { headers }
    );
    return response.data;
  },

  cancelMovement: async (id: string, reason?: string): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/cancel`,
      null,
      { 
        params: { reason },
        headers 
      }
    );
    return response.data;
  },

  holdMovement: async (id: string, reason?: string): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/hold`,
      null,
      { 
        params: { reason },
        headers 
      }
    );
    return response.data;
  },

  releaseMovement: async (id: string): Promise<ApiResponse<Movement>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/release`,
      {},
      { headers }
    );
    return response.data;
  },

  // ========================================
  // MOVEMENT LINES - ⭐ SEPARATE ENDPOINTS
  // ========================================

  // ⭐ Get lines for a specific movement
  getLinesByMovement: async (movementId: string): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(
      `/api/movement-lines/movement/${movementId}`
    );
    return response.data || [];
  },

  getMovementLineById: async (id: string): Promise<MovementLine> => {
    const response = await apiClient.get<MovementLine>(`/api/movement-lines/${id}`);
    return response.data;
  },

  addLineToMovement: async (movementId: string, data: Partial<MovementLine>): Promise<ApiResponse<MovementLine>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementLine>>(
      `/api/movement-lines/movement/${movementId}`,
      data,
      { headers }
    );
    return response.data;
  },

  updateMovementLine: async (id: string, data: Partial<MovementLine>): Promise<ApiResponse<MovementLine>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.put<ApiResponse<MovementLine>>(
      `/api/movement-lines/${id}`, 
      data,
      { headers }
    );
    return response.data;
  },

  deleteMovementLine: async (id: string): Promise<ApiResponse<void>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/movement-lines/${id}`,
      { headers }
    );
    return response.data;
  },

  completeMovementLine: async (id: string): Promise<ApiResponse<MovementLine>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementLine>>(
      `/api/movement-lines/${id}/complete`,
      {},
      { headers }
    );
    return response.data;
  },

  // ========================================
  // MOVEMENT TASKS - ⭐ SEPARATE ENDPOINTS
  // ========================================

  // ⭐ Get tasks for a specific movement
  getTasksByMovement: async (movementId: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      `/api/movement-tasks/movement/${movementId}`
    );
    return response.data || [];
  },

  getMovementTaskById: async (id: string): Promise<MovementTask> => {
    const response = await apiClient.get<MovementTask>(`/api/movement-tasks/${id}`);
    return response.data;
  },

  createTask: async (movementId: string, data: Partial<MovementTask>): Promise<ApiResponse<MovementTask>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `/api/movement-tasks/movement/${movementId}`,
      data,
      { headers }
    );
    return response.data;
  },

  updateMovementTask: async (id: string, data: Partial<MovementTask>): Promise<ApiResponse<MovementTask>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.put<ApiResponse<MovementTask>>(
      `/api/movement-tasks/${id}`, 
      data,
      { headers }
    );
    return response.data;
  },

  deleteMovementTask: async (id: string): Promise<ApiResponse<void>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/movement-tasks/${id}`,
      { headers }
    );
    return response.data;
  },

  assignTask: async (taskId: string, assignToUserId: string): Promise<ApiResponse<MovementTask>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `/api/movement-tasks/${taskId}/assign`,
      null,
      { 
        params: { assignToUserId },
        headers 
      }
    );
    return response.data;
  },

  startTask: async (taskId: string): Promise<ApiResponse<MovementTask>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `/api/movement-tasks/${taskId}/start`,
      {},
      { headers }
    );
    return response.data;
  },

  completeTask: async (taskId: string): Promise<ApiResponse<MovementTask>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `/api/movement-tasks/${taskId}/complete`,
      {},
      { headers }
    );
    return response.data;
  },

  cancelTask: async (taskId: string, reason?: string): Promise<ApiResponse<MovementTask>> => {
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `/api/movement-tasks/${taskId}/cancel`,
      null,
      { 
        params: { reason },
        headers 
      }
    );
    return response.data;
  },
};