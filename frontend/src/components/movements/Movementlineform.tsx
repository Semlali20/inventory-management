import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { movementService } from '../../services/movement.service';
import { toast } from 'react-hot-toast';

interface MovementLineFormProps {
  movementId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MovementLineForm: React.FC<MovementLineFormProps> = ({
  movementId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    requestedQuantity: 0,
    uom: 'UNIT',
    fromLocationId: '',
    toLocationId: '',
    lotId: '',
    serialId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemId.trim()) {
      toast.error('Item ID is required');
      return;
    }

    if (formData.requestedQuantity <= 0) {
      toast.error('Requested quantity must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      const lineData = {
        itemId: formData.itemId,
        requestedQuantity: formData.requestedQuantity,
        uom: formData.uom,
        fromLocationId: formData.fromLocationId || null,
        toLocationId: formData.toLocationId || null,
        lotId: formData.lotId || null,
        serialId: formData.serialId || null,
        notes: formData.notes || null,
        status: 'PENDING'
      };

      await movementService.addMovementLine(movementId, lineData);
      toast.success('Line added successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding line:', error);
      toast.error(error.message || 'Failed to add line');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-md font-medium text-gray-900">Add New Line</h4>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item ID *
          </label>
          <input
            type="text"
            value={formData.itemId}
            onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter item ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.requestedQuantity}
            onChange={(e) => setFormData({ ...formData, requestedQuantity: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UOM
          </label>
          <input
            type="text"
            value={formData.uom}
            onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="UNIT"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Location ID
          </label>
          <input
            type="text"
            value={formData.fromLocationId}
            onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="From location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Location ID
          </label>
          <input
            type="text"
            value={formData.toLocationId}
            onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="To location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lot ID
          </label>
          <input
            type="text"
            value={formData.lotId}
            onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional lot ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serial ID
          </label>
          <input
            type="text"
            value={formData.serialId}
            onChange={(e) => setFormData({ ...formData, serialId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional serial ID"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Optional notes"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <X className="w-4 h-4 inline mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-1" />
          {loading ? 'Adding...' : 'Add Line'}
        </button>
      </div>
    </form>
  );
};

export default MovementLineForm;