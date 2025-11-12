import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import {
  Alert,
  Notification,
  AlertRule,
  NotificationChannel,
  NotificationTemplate,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const alertService = {
  // Alerts
  getAlerts: async (params?: PaginationParams): Promise<PaginatedResponse<Alert>> => {
    const response = await apiClient.get<PaginatedResponse<Alert>>(API_ENDPOINTS.ALERTS.ALERTS, { params });
    return response.data;
  },

  getAlertById: async (id: string): Promise<Alert> => {
    const response = await apiClient.get<Alert>(API_ENDPOINTS.ALERTS.ALERT_BY_ID(id));
    return response.data;
  },

  createAlert: async (data: Partial<Alert>): Promise<ApiResponse<Alert>> => {
    const response = await apiClient.post<ApiResponse<Alert>>(API_ENDPOINTS.ALERTS.ALERTS, data);
    return response.data;
  },

  updateAlert: async (id: string, data: Partial<Alert>): Promise<ApiResponse<Alert>> => {
    const response = await apiClient.put<ApiResponse<Alert>>(API_ENDPOINTS.ALERTS.ALERT_BY_ID(id), data);
    return response.data;
  },

  deleteAlert: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ALERTS.ALERT_BY_ID(id));
    return response.data;
  },

  // Notifications
  getNotifications: async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(API_ENDPOINTS.ALERTS.NOTIFICATIONS, { params });
    return response.data;
  },

  getNotificationById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(API_ENDPOINTS.ALERTS.NOTIFICATION_BY_ID(id));
    return response.data;
  },

  markNotificationAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.put<ApiResponse<Notification>>(`${API_ENDPOINTS.ALERTS.NOTIFICATIONS}/${id}/read`);
    return response.data;
  },

  // Alert Rules
  getRules: async (params?: PaginationParams): Promise<PaginatedResponse<AlertRule>> => {
    const response = await apiClient.get<PaginatedResponse<AlertRule>>(API_ENDPOINTS.ALERTS.RULES, { params });
    return response.data;
  },

  getRuleById: async (id: string): Promise<AlertRule> => {
    const response = await apiClient.get<AlertRule>(API_ENDPOINTS.ALERTS.RULE_BY_ID(id));
    return response.data;
  },

  createRule: async (data: Partial<AlertRule>): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.post<ApiResponse<AlertRule>>(API_ENDPOINTS.ALERTS.RULES, data);
    return response.data;
  },

  updateRule: async (id: string, data: Partial<AlertRule>): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.put<ApiResponse<AlertRule>>(API_ENDPOINTS.ALERTS.RULE_BY_ID(id), data);
    return response.data;
  },

  deleteRule: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ALERTS.RULE_BY_ID(id));
    return response.data;
  },

  // Notification Channels
  getChannels: async (params?: PaginationParams): Promise<PaginatedResponse<NotificationChannel>> => {
    const response = await apiClient.get<PaginatedResponse<NotificationChannel>>(API_ENDPOINTS.ALERTS.CHANNELS, { params });
    return response.data;
  },

  getChannelById: async (id: string): Promise<NotificationChannel> => {
    const response = await apiClient.get<NotificationChannel>(API_ENDPOINTS.ALERTS.CHANNEL_BY_ID(id));
    return response.data;
  },

  createChannel: async (data: Partial<NotificationChannel>): Promise<ApiResponse<NotificationChannel>> => {
    const response = await apiClient.post<ApiResponse<NotificationChannel>>(API_ENDPOINTS.ALERTS.CHANNELS, data);
    return response.data;
  },

  updateChannel: async (id: string, data: Partial<NotificationChannel>): Promise<ApiResponse<NotificationChannel>> => {
    const response = await apiClient.put<ApiResponse<NotificationChannel>>(API_ENDPOINTS.ALERTS.CHANNEL_BY_ID(id), data);
    return response.data;
  },

  deleteChannel: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ALERTS.CHANNEL_BY_ID(id));
    return response.data;
  },

  // Notification Templates
  getTemplates: async (params?: PaginationParams): Promise<PaginatedResponse<NotificationTemplate>> => {
    const response = await apiClient.get<PaginatedResponse<NotificationTemplate>>(API_ENDPOINTS.ALERTS.TEMPLATES, { params });
    return response.data;
  },

  getTemplateById: async (id: string): Promise<NotificationTemplate> => {
    const response = await apiClient.get<NotificationTemplate>(API_ENDPOINTS.ALERTS.TEMPLATE_BY_ID(id));
    return response.data;
  },

  createTemplate: async (data: Partial<NotificationTemplate>): Promise<ApiResponse<NotificationTemplate>> => {
    const response = await apiClient.post<ApiResponse<NotificationTemplate>>(API_ENDPOINTS.ALERTS.TEMPLATES, data);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<NotificationTemplate>): Promise<ApiResponse<NotificationTemplate>> => {
    const response = await apiClient.put<ApiResponse<NotificationTemplate>>(API_ENDPOINTS.ALERTS.TEMPLATE_BY_ID(id), data);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ALERTS.TEMPLATE_BY_ID(id));
    return response.data;
  },
};

