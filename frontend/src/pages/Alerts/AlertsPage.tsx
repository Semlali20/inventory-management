// frontend/src/pages/Alerts/AlertsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  AlertOctagon,
  Check,
  X,
  Filter,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { alertService, Alert as AlertType } from '@/services/alert.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useEnrichedAlerts } from '@/hooks/useEnrichedAlerts';
import { parseAlertData, formatAlertDetails } from '@/utils/alertUtils';

// ============================================================================
// MAIN ALERTS PAGE COMPONENT
// ============================================================================

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Enrich alerts with item names and location codes
  const enrichedAlerts = useEnrichedAlerts(alerts);

  useEffect(() => {
    fetchAlerts();
  }, [pagination.page]);

  // ============================================================================
  // FETCH ALERTS
  // ============================================================================

  const scanForNewAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/inventory/scan-for-alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const message = await response.text();
        console.log('Alert scan:', message);
      }
    } catch (error) {
      console.error('Failed to scan for alerts:', error);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // First, scan for new alerts
      await scanForNewAlerts();

      const params: any = {
        page: pagination.page,
        size: pagination.size,
      };

      // Then fetch all alerts - filtering will be done on frontend
      const response = await alertService.getAlerts(params);

      setAlerts(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ALERT ACTIONS
  // ============================================================================

  const handleAcknowledge = async (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await alertService.acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await alertService.resolveAlert(alertId);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleEscalate = async (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await alertService.escalateAlert(alertId);
      toast.success('Alert escalated');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to escalate alert:', error);
      toast.error('Failed to escalate alert');
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5" />;
      case 'INFO':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'EMERGENCY': // Map EMERGENCY to CRITICAL
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'WARNING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'INFO':
      case 'INFORMATION': // Map INFORMATION to INFO
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const normalizeLevelName = (level: string): string => {
    switch (level) {
      case 'EMERGENCY':
        return 'CRITICAL';
      case 'INFORMATION':
        return 'INFO';
      default:
        return level;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'OVERSTOCK':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'EXPIRY':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'QUALITY':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'LOCATION':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'MOVEMENT':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'ACKNOWLEDGED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ESCALATED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredAlerts = enrichedAlerts.filter((alert) => {
    const matchesSearch = searchTerm
      ? (alert.formattedMessage || alert.message).toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alert.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      : true;

    const matchesType = filterType ? alert.type === filterType : true;
    // Normalize the level before comparing (EMERGENCY -> CRITICAL, INFORMATION -> INFO)
    const normalizedAlertLevel = normalizeLevelName(alert.level);
    const matchesLevel = filterLevel ? normalizedAlertLevel === filterLevel : true;
    const matchesStatus = filterStatus ? alert.status === filterStatus : true;

    return matchesSearch && matchesType && matchesLevel && matchesStatus;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage system alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OVERSTOCK">Overstock</option>
            <option value="EXPIRY">Expiry</option>
            <option value="QUALITY">Quality</option>
            <option value="LOCATION">Location</option>
            <option value="MOVEMENT">Movement</option>
            <option value="SYSTEM">System</option>
          </Select>

          {/* Level Filter */}
          <Select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </Select>

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </Select>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No alerts found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm || filterType || filterLevel || filterStatus
                ? 'Try adjusting your filters'
                : 'All systems are running smoothly'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAlert(alert);
                  setShowDetailsModal(true);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Alert Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getLevelColor(
                      alert.level
                    )}`}
                  >
                    {getLevelIcon(alert.level)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getTypeColor(
                            alert.type
                          )}`}
                        >
                          {alert.type.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getLevelColor(
                            alert.level
                          )}`}
                        >
                          {normalizeLevelName(alert.level)}
                        </span>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getStatusColor(
                            alert.status
                          )}`}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {(() => {
                        const data = parseAlertData(alert);
                        const itemName = alert.itemName || 'Item';
                        const locationCode = alert.locationCode || 'Unknown location';
                        const qty = data.currentQuantity ?? 0;
                        const threshold = data.threshold ?? 0;

                        if (alert.type === 'LOW_STOCK') {
                          return `Low stock detected for ${itemName}: ${qty} units left at ${locationCode}`;
                        }

                        return alert.formattedMessage || alert.message;
                      })()}
                    </p>

                    {(alert.itemName || alert.locationCode) && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {formatAlertDetails(alert, alert.itemName, alert.locationCode)}
                      </p>
                    )}

                    {/* Action Buttons */}
                    {alert.status !== 'RESOLVED' && (
                      <div className="flex items-center gap-2 mt-3">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleResolve(alert.id, e)}
                          className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                        {alert.level === 'CRITICAL' && alert.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEscalate(alert.id, e)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Escalate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {pagination.page * pagination.size + 1} to{' '}
              {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
              {pagination.totalElements} alerts
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Alert Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAlert && (() => {
          const enrichedAlert = enrichedAlerts.find(a => a.id === selectedAlert.id) || selectedAlert;
          const alertData = parseAlertData(enrichedAlert);

          return (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Alert Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${getTypeColor(selectedAlert.type)}`}>
                      {selectedAlert.type.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${getLevelColor(selectedAlert.level)}`}>
                      {normalizeLevelName(selectedAlert.level)}
                    </span>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${getStatusColor(selectedAlert.status)}`}>
                      {selectedAlert.status === 'ESCALATED' ? 'ACTIVE' : selectedAlert.status}
                    </span>
                  </div>

                  {/* Message */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {(() => {
                        const itemName = enrichedAlert.itemName || 'Item';
                        const locationCode = enrichedAlert.locationCode || 'Unknown location';
                        const qty = alertData.currentQuantity ?? 0;
                        const threshold = alertData.threshold ?? 0;

                        if (enrichedAlert.type === 'LOW_STOCK') {
                          return `Low stock detected for ${itemName}: ${qty} units left at ${locationCode}`;
                        }

                        return enrichedAlert.formattedMessage || enrichedAlert.message;
                      })()}
                    </p>
                  </div>

                  {/* Stock Details */}
                  {alertData && (alertData.itemId || alertData.locationId) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Stock Details
                      </h3>
                      <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 space-y-2">
                        {enrichedAlert.itemName && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Item:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {enrichedAlert.itemName}
                            </span>
                          </div>
                        )}
                        {enrichedAlert.locationCode && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {enrichedAlert.locationCode}
                            </span>
                          </div>
                        )}
                        {alertData.currentQuantity !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Current Quantity:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {alertData.currentQuantity} units
                            </span>
                          </div>
                        )}
                        {alertData.threshold !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Threshold:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {alertData.threshold} units
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Attributes */}
                  {enrichedAlert.itemAttributes && Object.keys(enrichedAlert.itemAttributes).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Item Attributes
                      </h3>
                      <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 space-y-2">
                        {Object.entries(enrichedAlert.itemAttributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(selectedAlert.createdAt)}
                        </span>
                      </div>
                      {selectedAlert.acknowledgedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Acknowledged:</span>
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(selectedAlert.acknowledgedAt)}
                            {selectedAlert.acknowledgedBy && ` by ${selectedAlert.acknowledgedBy}`}
                          </span>
                        </div>
                      )}
                      {selectedAlert.resolvedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Resolved:</span>
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(selectedAlert.resolvedAt)}
                            {selectedAlert.resolvedBy && ` by ${selectedAlert.resolvedBy}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedAlert.status !== 'RESOLVED' && (
                    <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      {!selectedAlert.acknowledged && (
                        <Button
                          onClick={(e) => {
                            handleAcknowledge(selectedAlert.id, e);
                            setShowDetailsModal(false);
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          handleResolve(selectedAlert.id, e);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                      {selectedAlert.level === 'CRITICAL' && selectedAlert.status === 'ACTIVE' && (
                        <Button
                          onClick={(e) => {
                            handleEscalate(selectedAlert.id, e);
                            setShowDetailsModal(false);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Escalate
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        );
        })()}
      </AnimatePresence>
    </div>
  );
};
