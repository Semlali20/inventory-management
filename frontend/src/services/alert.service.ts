// frontend/src/services/alert.service.ts
// ✅ COMPLETE VERSION WITH CREATE ALERT

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import { PaginatedResponse, PaginationParams, ApiResponse } from '@/types';

export const alertService = {
  // ========== ALERTS ==========
  
  getAlerts: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(API_ENDPOINTS.ALERTS.ALERTS, { params });
    return response.data;
  },

  getAlertById: async (id: string): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.ALERTS.ALERT_BY_ID(id));
    return response.data;
  },

  // ✅ NEW: Create alert
  createAlert: async (data: {
    type: string;
    severity: string;
    title: string;
    message: string;
    itemId?: string;
    locationId?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ALERTS.ALERTS, data);
      return response.data;
    } catch (error) {
      console.error('Create alert error:', error);
      throw error;
    }
  },

  updateAlert: async (id: string, data: Partial<any>): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(API_ENDPOINTS.ALERTS.ALERT_BY_ID(id), data);
    return response.data;
  },

  deleteAlert: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ALERTS.ALERT_BY_ID(id));
    return response.data;
  },

  acknowledgeAlert: async (id: string): Promise<any> => {
    const response = await apiClient.post(`${API_ENDPOINTS.ALERTS.ALERT_BY_ID(id)}/acknowledge`);
    return response.data;
  },

  // ========== NOTIFICATIONS ==========
  
  getNotifications: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(API_ENDPOINTS.ALERTS.NOTIFICATIONS, { params });
    return response.data;
  },

  getNotificationById: async (id: string): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.ALERTS.NOTIFICATION_BY_ID(id));
    return response.data;
  },

  markNotificationAsRead: async (id: string): Promise<any> => {
    const response = await apiClient.post(`${API_ENDPOINTS.ALERTS.NOTIFICATION_BY_ID(id)}/read`);
    return response.data;
  },

  // ========== ALERT RULES ==========
  
  getAlertRules: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(API_ENDPOINTS.ALERTS.RULES, { params });
    return response.data;
  },

  getAlertRuleById: async (id: string): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.ALERTS.RULE_BY_ID(id));
    return response.data;
  },

  createAlertRule: async (data: Partial<any>): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(API_ENDPOINTS.ALERTS.RULES, data);
    return response.data;
  },

  updateAlertRule: async (id: string, data: Partial<any>): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(API_ENDPOINTS.ALERTS.RULE_BY_ID(id), data);
    return response.data;
  },

  deleteAlertRule: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ALERTS.RULE_BY_ID(id));
    return response.data;
  },
};