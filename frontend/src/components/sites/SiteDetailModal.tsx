// src/components/sites/SiteDetailModal.tsx
import React from 'react';
import { X, Building2, MapPin, Globe, Calendar, CheckCircle, XCircle, Edit, Clock } from 'lucide-react';

interface SiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: any;
  onEdit?: () => void;
}

export const SiteDetailModal: React.FC<SiteDetailModalProps> = ({
  isOpen,
  onClose,
  site,
  onEdit
}) => {
  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Site Details</h2>
              <p className="text-indigo-100 text-sm">{site.code || site.name}</p>
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="text-indigo-600" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Site Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{site.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Site Code
                  </label>
                  <p className="text-lg font-mono text-gray-900 bg-white px-3 py-1 rounded border border-gray-200 inline-block">
                    {site.code || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Site Type
                  </label>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {site.type || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      site.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {site.isActive ? (
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
                <MapPin className="text-purple-600" size={20} />
                Location Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <p className="text-base text-gray-900">{site.address || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      City
                    </label>
                    <p className="text-base text-gray-900">{site.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      State/Province
                    </label>
                    <p className="text-base text-gray-900">{site.state || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Postal Code
                    </label>
                    <p className="text-base text-gray-900">{site.postalCode || site.postal_code || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Globe size={14} />
                      Country
                    </label>
                    <p className="text-base text-gray-900">{site.country || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock size={14} />
                      Timezone
                    </label>
                    <p className="text-base text-gray-900">{site.timezone || 'N/A'}</p>
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
                    {site.createdAt || site.created_at ? new Date(site.createdAt || site.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Last Updated
                  </label>
                  <p className="text-base text-gray-900">
                    {site.updatedAt || site.updated_at ? new Date(site.updatedAt || site.updated_at).toLocaleString() : 'N/A'}
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
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Site
            </button>
          )}
        </div>
      </div>
    </div>
  );
};