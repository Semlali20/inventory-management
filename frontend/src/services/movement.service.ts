import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import { Movement, MovementLine, MovementTask, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';

export const movementService = {
  // Movements
  getMovements: async (params?: PaginationParams): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(API_ENDPOINTS.MOVEMENTS.MOVEMENTS, { params });
    return response.data;
  },

  getMovementById: async (id: string): Promise<Movement> => {
    const response = await apiClient.get<Movement>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id));
    return response.data;
  },

  createMovement: async (data: Partial<Movement>): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.post<ApiResponse<Movement>>(API_ENDPOINTS.MOVEMENTS.MOVEMENTS, data);
    return response.data;
  },

  updateMovement: async (id: string, data: Partial<Movement>): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.put<ApiResponse<Movement>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id), data);
    return response.data;
  },

  deleteMovement: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id));
    return response.data;
  },

  // Movement Lines
  getMovementLines: async (params?: PaginationParams): Promise<PaginatedResponse<MovementLine>> => {
    const response = await apiClient.get<PaginatedResponse<MovementLine>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINES, { params });
    return response.data;
  },

  getMovementLineById: async (id: string): Promise<MovementLine> => {
    const response = await apiClient.get<MovementLine>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id));
    return response.data;
  },

  createMovementLine: async (data: Partial<MovementLine>): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.post<ApiResponse<MovementLine>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINES, data);
    return response.data;
  },

  updateMovementLine: async (id: string, data: Partial<MovementLine>): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.put<ApiResponse<MovementLine>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id), data);
    return response.data;
  },

  deleteMovementLine: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id));
    return response.data;
  },

  // Movement Tasks
  getMovementTasks: async (params?: PaginationParams): Promise<PaginatedResponse<MovementTask>> => {
    const response = await apiClient.get<PaginatedResponse<MovementTask>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS, { params });
    return response.data;
  },

  getMovementTaskById: async (id: string): Promise<MovementTask> => {
    const response = await apiClient.get<MovementTask>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id));
    return response.data;
  },

  createMovementTask: async (data: Partial<MovementTask>): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS, data);
    return response.data;
  },

  updateMovementTask: async (id: string, data: Partial<MovementTask>): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.put<ApiResponse<MovementTask>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id), data);
    return response.data;
  },

  deleteMovementTask: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id));
    return response.data;
  },
};

