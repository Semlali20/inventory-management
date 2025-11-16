// src/components/warehouses/WarehouseDetailModal.tsx
import React from 'react';
import { X, Warehouse, MapPin, Users, Phone, Calendar, CheckCircle, XCircle, Edit } from 'lucide-react';

interface WarehouseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: any;
  onEdit?: () => void;
}

export const WarehouseDetailModal: React.FC<WarehouseDetailModalProps> = ({
  isOpen,
  onClose,
  warehouse,
  onEdit
}) => {
  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Warehouse className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Warehouse Details</h2>
              <p className="text-blue-100 text-sm">{warehouse.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Main Info Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Warehouse className="text-blue-600" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Warehouse Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{warehouse.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Warehouse Code
                  </label>
                  <p className="text-lg font-mono text-gray-900 bg-white px-3 py-1 rounded border border-gray-200 inline-block">
                    {warehouse.code || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={14} />
                    Site
                  </label>
                  <p className="text-base text-gray-900">{warehouse.siteName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      warehouse.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {warehouse.isActive ? (
                      <>
                        <CheckCircle size={16} />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-indigo-600" size={20} />
                Location Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <p className="text-base text-gray-900">{warehouse.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Capacity & Management Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {warehouse.capacity || 'N/A'}
                </div>
                <p className="text-sm text-gray-500 mt-1">Total capacity</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="text-purple-600" size={20} />
                  Management
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Manager
                    </label>
                    <p className="text-base text-gray-900">{warehouse.managerName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Phone size={14} />
                      Contact Phone
                    </label>
                    <p className="text-base text-gray-900">{warehouse.contactPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-gray-600" size={20} />
                Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Created At
                  </label>
                  <p className="text-base text-gray-900">
                    {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Last Updated
                  </label>
                  <p className="text-base text-gray-900">
                    {warehouse.updatedAt ? new Date(warehouse.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Warehouse
            </button>
          )}
        </div>
      </div>
    </div>
  );
};