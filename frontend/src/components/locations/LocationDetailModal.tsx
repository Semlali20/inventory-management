// src/components/locations/LocationDetailModal.tsx
import React from 'react';
import { X, MapPinned, Warehouse, Grid3x3, Calendar, CheckCircle, XCircle, Edit, Box } from 'lucide-react';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: any;
  onEdit?: () => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  isOpen,
  onClose,
  location,
  onEdit
}) => {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <MapPinned className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Location Details</h2>
              <p className="text-emerald-100 text-sm">{location.code}</p>
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
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinned className="text-emerald-600" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Location Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{location.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Location Code
                  </label>
                  <p className="text-lg font-mono text-gray-900 bg-white px-3 py-1 rounded border border-gray-200 inline-block">
                    {location.code || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Warehouse size={14} />
                    Warehouse
                  </label>
                  <p className="text-base text-gray-900">{location.warehouseName || location.warehouse_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Location Type
                  </label>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {location.locationType || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Position Grid Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Grid3x3 className="text-teal-600" size={20} />
                Storage Position
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <label className="block text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">
                    Zone
                  </label>
                  <p className="text-2xl font-bold text-blue-900">{location.zone || '-'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <label className="block text-xs font-medium text-purple-700 uppercase tracking-wider mb-2">
                    Aisle
                  </label>
                  <p className="text-2xl font-bold text-purple-900">{location.aisle || '-'}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                  <label className="block text-xs font-medium text-pink-700 uppercase tracking-wider mb-2">
                    Rack
                  </label>
                  <p className="text-2xl font-bold text-pink-900">{location.rack || '-'}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <label className="block text-xs font-medium text-orange-700 uppercase tracking-wider mb-2">
                    Shelf
                  </label>
                  <p className="text-2xl font-bold text-orange-900">{location.shelf || '-'}</p>
                </div>
              </div>
            </div>

            {/* Capacity & Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Box className="text-emerald-600" size={20} />
                  Capacity
                </h3>
                <div className="text-3xl font-bold text-emerald-600">
                  {location.capacity || 'N/A'}
                </div>
                <p className="text-sm text-gray-500 mt-1">Maximum capacity</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold ${
                    location.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {location.isActive ? (
                    <>
                      <CheckCircle size={20} />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      Inactive
                    </>
                  )}
                </span>
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
                    {location.createdAt || location.created_at ? new Date(location.createdAt || location.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Last Updated
                  </label>
                  <p className="text-base text-gray-900">
                    {location.updatedAt || location.updated_at ? new Date(location.updatedAt || location.updated_at).toLocaleString() : 'N/A'}
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
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};