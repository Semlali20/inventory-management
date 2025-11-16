// src/components/sites/SiteFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  site?: any;
}

interface SettingItem {
  key: string;
  value: string;
}

export const SiteFormModal: React.FC<SiteFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  site
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'WAREHOUSE' as 'WAREHOUSE' | 'DISTRIBUTION_CENTER' | 'STORE' | 'MANUFACTURING' | 'PICKING' | 'STAGING' | 'SHIPPING' | 'QUARANTINE',
    timezone: '',
    address: ''
  });
  
  // Easy settings - array of key-value pairs
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && site) {
      setFormData({
        name: site.name || '',
        type: site.type || 'WAREHOUSE',
        timezone: site.timezone || '',
        address: site.address || ''
      });

      // Parse JSON string settings from backend to array
      if (site.settings) {
        try {
          const parsedSettings = JSON.parse(site.settings);
          const settingsArray = Object.entries(parsedSettings).map(([key, value]) => ({
            key,
            value: String(value)
          }));
          setSettings(settingsArray);
        } catch (e) {
          console.error('Failed to parse settings:', e);
          setSettings([]);
        }
      } else {
        setSettings([]);
      }
    } else {
      setFormData({
        name: '',
        type: 'WAREHOUSE',
        timezone: '',
        address: ''
      });
      setSettings([]);
    }
  }, [mode, site, isOpen]);

  // Add new setting row
  const handleAddSetting = () => {
    setSettings([...settings, { key: '', value: '' }]);
  };

  // Remove setting row
  const handleRemoveSetting = (index: number) => {
    setSettings(settings.filter((_, i) => i !== index));
  };

  // Update setting key or value
  const handleSettingChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSettings = [...settings];
    newSettings[index][field] = value;
    setSettings(newSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert settings array to JSON object then to string
      let settingsJson = null;
      if (settings.length > 0) {
        const settingsObject: Record<string, string> = {};
        settings.forEach(item => {
          if (item.key.trim()) { // Only add if key is not empty
            settingsObject[item.key.trim()] = item.value;
          }
        });
        // Convert to JSON string for backend: "{\"key\":\"value\"}"
        settingsJson = JSON.stringify(settingsObject);
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        timezone: formData.timezone || null,
        address: formData.address || null,
        settings: settingsJson // Send as JSON string
      };

      if (mode === 'create') {
        await locationService.createSite(payload);
        toast.success('Site created successfully');
      } else {
        await locationService.updateSite(site.id, payload);
        toast.success('Site updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving site:', error);
      toast.error(error?.response?.data?.message || `Failed to ${mode} site`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Create Site' : 'Edit Site'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter site name"
              />
            </div>

            {/* Type - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
              >
                <option value="WAREHOUSE">Warehouse</option>
                <option value="DISTRIBUTION_CENTER">Distribution Center</option>
                <option value="STORE">Store</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="PICKING">Picking</option>
                <option value="STAGING">Staging</option>
                <option value="SHIPPING">Shipping</option>
                <option value="QUARANTINE">Quarantine</option>
              </Select>
            </div>
          </div>

          {/* Timezone - Optional */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Timezone
            </label>
            <Input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              placeholder="e.g., America/New_York, Europe/Paris, Asia/Tokyo"
            />
          </div>

          {/* Address - Optional */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Address
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
            />
          </div>

          {/* Settings - Easy Key-Value Editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Settings (Optional)
              </label>
              <Button
                type="button"
                onClick={handleAddSetting}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                Add Setting
              </Button>
            </div>
            
            {settings.length === 0 ? (
              <div className="border rounded p-4 text-center text-gray-500 text-sm">
                No settings added. Click "Add Setting" to add configuration options.
              </div>
            ) : (
              <div className="border rounded p-3 space-y-2">
                {settings.map((setting, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      placeholder="Key (e.g., capacity)"
                      value={setting.key}
                      onChange={(e) => handleSettingChange(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-gray-400">:</span>
                    <Input
                      type="text"
                      placeholder="Value (e.g., 10000)"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSetting(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Add custom key-value pairs for additional configuration
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};