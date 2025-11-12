export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Stock Management System';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  // Products
  PRODUCTS: {
    ITEMS: '/api/items',
    ITEM_BY_ID: (id: string) => `/api/items/${id}`,
    CATEGORIES: '/api/categories',
    CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,
    ITEM_VARIANTS: '/api/item-variants',
    ITEM_VARIANT_BY_ID: (id: string) => `/api/item-variants/${id}`,
  },
  // Inventory
  INVENTORY: {
    INVENTORY: '/api/inventory',
    INVENTORY_BY_ID: (id: string) => `/api/inventory/${id}`,
    LOTS: '/api/lots',
    LOT_BY_ID: (id: string) => `/api/lots/${id}`,
    SERIALS: '/api/serials',
    SERIAL_BY_ID: (id: string) => `/api/serials/${id}`,
  },
  // Movements
  MOVEMENTS: {
    MOVEMENTS: '/api/movements',
    MOVEMENT_BY_ID: (id: string) => `/api/movements/${id}`,
    MOVEMENT_TASKS: '/api/movement-tasks',
    MOVEMENT_TASK_BY_ID: (id: string) => `/api/movement-tasks/${id}`,
    MOVEMENT_LINES: '/api/movement-lines',
    MOVEMENT_LINE_BY_ID: (id: string) => `/api/movement-lines/${id}`,
  },
  // Locations
  LOCATIONS: {
    LOCATIONS: '/api/locations',
    LOCATION_BY_ID: (id: string) => `/api/locations/${id}`,
    SITES: '/api/sites',
    SITE_BY_ID: (id: string) => `/api/sites/${id}`,
    WAREHOUSES: '/api/warehouses',
    WAREHOUSE_BY_ID: (id: string) => `/api/warehouses/${id}`,
  },
  // Quality
  QUALITY: {
    QUALITY_CONTROLS: '/api/quality/controls',
    QUALITY_CONTROL_BY_ID: (id: string) => `/api/quality/controls/${id}`,
    QUARANTINE: '/api/quality/quarantine',
    QUARANTINE_BY_ID: (id: string) => `/api/quality/quarantine/${id}`,
    ATTACHMENTS: '/api/quality/attachments',
    ATTACHMENT_BY_ID: (id: string) => `/api/quality/attachments/${id}`,
  },
  // Alerts
  ALERTS: {
    ALERTS: '/api/alerts',
    ALERT_BY_ID: (id: string) => `/api/alerts/${id}`,
    NOTIFICATIONS: '/api/notifications',
    NOTIFICATION_BY_ID: (id: string) => `/api/notifications/${id}`,
    RULES: '/api/rules',
    RULE_BY_ID: (id: string) => `/api/rules/${id}`,
    CHANNELS: '/api/notification-channels',
    CHANNEL_BY_ID: (id: string) => `/api/notification-channels/${id}`,
    TEMPLATES: '/api/notification-templates',
    TEMPLATE_BY_ID: (id: string) => `/api/notification-templates/${id}`,
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  INVENTORY: '/inventory',
  MOVEMENTS: '/movements',
  MOVEMENT_DETAIL: (id: string) => `/movements/${id}`,
  LOCATIONS: '/locations',
  QUALITY: '/quality',
  ALERTS: '/alerts',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

