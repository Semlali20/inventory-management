// frontend/src/hooks/useEnrichedAlerts.ts
import { useState, useEffect } from 'react';
import { Alert } from '@/services/alert.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { parseAlertData, formatAlertMessage } from '@/utils/alertUtils';

export interface EnrichedAlert extends Alert {
  itemName?: string;
  itemSku?: string;
  itemAttributes?: Record<string, any>;
  locationCode?: string;
  formattedMessage?: string;
}

/**
 * Hook to enrich alerts with item names and location codes
 */
export function useEnrichedAlerts(alerts: Alert[]): EnrichedAlert[] {
  const [enrichedAlerts, setEnrichedAlerts] = useState<EnrichedAlert[]>([]);

  useEffect(() => {
    const enrichAlerts = async () => {
      const promises = alerts.map(async (alert) => {
        try {
          const data = parseAlertData(alert);
          let itemName: string | undefined;
          let itemSku: string | undefined;
          let itemAttributes: Record<string, any> | undefined;
          let locationCode: string | undefined;

          // Fetch item details if available
          if (data.itemId) {
            try {
              const item = await productService.getItemById(data.itemId);
              itemName = item.name;
              itemSku = item.sku;

              // Parse attributes if it's a string
              if (item.attributes) {
                if (typeof item.attributes === 'string') {
                  try {
                    itemAttributes = JSON.parse(item.attributes);
                  } catch (e) {
                    console.error('Failed to parse item attributes:', e);
                    itemAttributes = item.attributes as any;
                  }
                } else {
                  itemAttributes = item.attributes;
                }
              }
            } catch (error) {
              console.error('Failed to fetch item:', error);
            }
          }

          // Fetch location code if available
          if (data.locationId) {
            try {
              const location = await locationService.getLocationById(data.locationId);
              locationCode = location.code;
            } catch (error) {
              console.error('Failed to fetch location:', error);
            }
          }

          // Format the message with actual names
          const formattedMessage = formatAlertMessage(alert, itemName, locationCode);

          return {
            ...alert,
            itemName,
            itemSku,
            itemAttributes,
            locationCode,
            formattedMessage,
          } as EnrichedAlert;
        } catch (error) {
          console.error('Failed to enrich alert:', error);
          return alert as EnrichedAlert;
        }
      });

      const results = await Promise.all(promises);
      setEnrichedAlerts(results);
    };

    if (alerts.length > 0) {
      enrichAlerts();
    } else {
      setEnrichedAlerts([]);
    }
  }, [alerts]);

  return enrichedAlerts;
}
