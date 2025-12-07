// frontend/src/utils/alertUtils.ts
import { Alert } from '@/services/alert.service';

export interface ParsedAlertData {
  itemId?: string;
  itemName?: string;
  locationId?: string;
  locationCode?: string;
  currentQuantity?: number;
  threshold?: number;
  alertReason?: string;
}

/**
 * Parse the alert data field which may be URL-encoded JSON
 */
export function parseAlertData(alert: Alert): ParsedAlertData {
  if (!alert.data) return {};

  try {
    // Check if data has rawData field (URL-encoded)
    if (alert.data.rawData && typeof alert.data.rawData === 'string') {
      const decoded = decodeURIComponent(alert.data.rawData);
      return JSON.parse(decoded);
    }

    // Otherwise return data as-is
    return alert.data as ParsedAlertData;
  } catch (error) {
    console.error('Failed to parse alert data:', error);
    return {};
  }
}

/**
 * Decode URL-encoded message
 */
function decodeMessage(message: string): string {
  try {
    return decodeURIComponent(message);
  } catch (error) {
    return message;
  }
}

/**
 * Format a user-friendly alert message with actual item/location names
 */
export function formatAlertMessage(alert: Alert, itemName?: string, locationCode?: string): string {
  const data = parseAlertData(alert);

  // Decode the original message first
  const decodedOriginalMessage = decodeMessage(alert.message);

  // For LOW_STOCK alerts
  if (alert.type === 'LOW_STOCK') {
    const item = itemName || 'Item';
    const location = locationCode || 'location';
    const qty = data.currentQuantity ?? 0;
    const threshold = data.threshold ?? 0;

    if (alert.level === 'CRITICAL' || alert.level === 'WARNING') {
      const level = alert.level === 'CRITICAL' ? 'Critical' : 'Low';
      return `${level} stock alert: ${item} has only ${qty} unit${qty !== 1 ? 's' : ''} left at ${location} (minimum: ${threshold})`;
    }
  }

  // For OVERSTOCK alerts
  if (alert.type === 'OVERSTOCK') {
    const item = itemName || 'Item';
    const location = locationCode || 'location';
    const qty = data.currentQuantity ?? 0;
    return `Overstock alert: ${item} has ${qty} units at ${location}`;
  }

  // For EXPIRY alerts
  if (alert.type === 'EXPIRY') {
    const item = itemName || 'Item';
    const daysUntilExpiry = data.threshold ?? 0;
    return `Expiry alert: ${item} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
  }

  // For LOCATION alerts
  if (alert.type === 'LOCATION') {
    const location = locationCode || 'Location';
    const percentage = data.currentQuantity ?? 0;
    return `Location capacity: ${location} is ${percentage}% full`;
  }

  // Fallback to decoded original message
  return decodedOriginalMessage;
}

/**
 * Format alert data for display in details modal
 */
export function formatAlertDetails(alert: Alert, itemName?: string, locationCode?: string): string {
  const data = parseAlertData(alert);

  const details: string[] = [];

  if (itemName) {
    details.push(`Item: ${itemName}`);
  }

  if (locationCode) {
    details.push(`Location: ${locationCode}`);
  }

  if (data.currentQuantity !== undefined) {
    details.push(`Current Quantity: ${data.currentQuantity}`);
  }

  if (data.threshold !== undefined) {
    details.push(`Threshold: ${data.threshold}`);
  }

  return details.join(' • ');
}
