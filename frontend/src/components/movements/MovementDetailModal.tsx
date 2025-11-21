import React, { useState, useEffect } from 'react';
import {
  X, Edit, Save, Plus, Trash2, PlayCircle, CheckCircle, XCircle,
  Pause, AlertCircle, Package, ClipboardList, Users, Calendar,
  MapPin, FileText, Clock, TrendingUp
} from 'lucide-react';
import { movementService } from '../../services/movement.service';
import { Movement, MovementLine, MovementTask, MovementStatus, MovementType, MovementPriority } from '../../types';
import MovementLineForm from './MovementLineForm';
import MovementTaskCard from './MovementTaskCard';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface MovementDetailModalProps {
  movement: Movement;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onStatusChange: (movementId: string, action: string, reason?: string) => void;
  onDelete: (movementId: string) => void;
}

type TabType = 'details' | 'lines' | 'tasks';

const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  movement: initialMovement,
  isOpen,
  onClose,
  onUpdate,
  onStatusChange,
  onDelete
}) => {
  const [movement, setMovement] = useState<Movement>(initialMovement);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<MovementLine[]>([]);
  const [tasks, setTasks] = useState<MovementTask[]>([]);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editedMovement, setEditedMovement] = useState({
    type: movement.type,
    priority: movement.priority,
    expectedDate: movement.expectedDate || '',
    scheduledDate: movement.scheduledDate || '',
    sourceLocationId: movement.sourceLocationId || '',
    destinationLocationId: movement.destinationLocationId || '',
    warehouseId: movement.warehouseId,
    notes: movement.notes || ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchMovementDetails();
      fetchLines();
      fetchTasks();
    }
  }, [isOpen, movement.id]);

  const fetchMovementDetails = async () => {
    try {
      const response = await movementService.getMovementById(movement.id);
      setMovement(response);
    } catch (error: any) {
      console.error('Error fetching movement details:', error);
      toast.error('Failed to fetch movement details');
    }
  };

  const fetchLines = async () => {
    try {
      const linesData = await movementService.getMovementLinesByMovement(movement.id);
      setLines(linesData);
    } catch (error: any) {
      console.error('Error fetching movement lines:', error);
      toast.error('Failed to fetch movement lines');
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksData = await movementService.getMovementTasksByMovement(movement.id);
      setTasks(tasksData);
    } catch (error: any) {
      console.error('Error fetching movement tasks:', error);
      toast.error('Failed to fetch movement tasks');
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await movementService.updateMovement(movement.id, editedMovement);
      setMovement(response.data);
      setIsEditing(false);
      toast.success('Movement updated successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Error updating movement:', error);
      toast.error(error.message || 'Failed to update movement');
    } finally {
      setLoading(false);
    }
  };

  const handleLineAdded = () => {
    setIsAddingLine(false);
    fetchLines();
    fetchMovementDetails();
  };

  const handleLineUpdated = () => {
    fetchLines();
    fetchMovementDetails();
  };

  const handleLineDeleted = async (lineId: string) => {
    if (!window.confirm('Are you sure you want to delete this line?')) {
      return;
    }

    try {
      await movementService.deleteMovementLine(lineId);
      toast.success('Line deleted successfully');
      fetchLines();
      fetchMovementDetails();
    } catch (error: any) {
      console.error('Error deleting line:', error);
      toast.error(error.message || 'Failed to delete line');
    }
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    fetchMovementDetails();
  };

  const getStatusColor = (status: MovementStatus) => {
    const colors = {
      [MovementStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [MovementStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [MovementStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [MovementStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [MovementStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [MovementStatus.ON_HOLD]: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: MovementType) => {
    const colors = {
      [MovementType.INBOUND]: 'bg-green-100 text-green-800',
      [MovementType.OUTBOUND]: 'bg-red-100 text-red-800',
      [MovementType.TRANSFER]: 'bg-blue-100 text-blue-800',
      [MovementType.ADJUSTMENT]: 'bg-purple-100 text-purple-800',
      [MovementType.RETURN]: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: MovementPriority) => {
    const colors = {
      [MovementPriority.LOW]: 'bg-gray-100 text-gray-800',
      [MovementPriority.NORMAL]: 'bg-blue-100 text-blue-800',
      [MovementPriority.HIGH]: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const canEdit = () => {
    return [MovementStatus.DRAFT, MovementStatus.PENDING].includes(movement.status);
  };

  const canDelete = () => {
    return [MovementStatus.DRAFT, MovementStatus.CANCELLED].includes(movement.status);
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (movement.status === MovementStatus.PENDING) {
      actions.push({ label: 'Start', action: 'start', icon: PlayCircle, color: 'blue' });
    }
    
    if (movement.status === MovementStatus.IN_PROGRESS) {
      actions.push({ label: 'Complete', action: 'complete', icon: CheckCircle, color: 'green' });
      actions.push({ label: 'Hold', action: 'hold', icon: Pause, color: 'orange', requiresReason: true });
    }
    
    if (movement.status === MovementStatus.ON_HOLD) {
      actions.push({ label: 'Release', action: 'release', icon: PlayCircle, color: 'blue' });
    }
    
    if ([MovementStatus.PENDING, MovementStatus.IN_PROGRESS, MovementStatus.ON_HOLD].includes(movement.status)) {
      actions.push({ label: 'Cancel', action: 'cancel', icon: XCircle, color: 'red', requiresReason: true });
    }
    
    return actions;
  };

  const handleAction = (action: string, requiresReason: boolean) => {
    if (requiresReason) {
      const reason = window.prompt(`Please provide a reason for ${action}:`);
      if (reason) {
        onStatusChange(movement.id, action, reason);
      }
    } else {
      onStatusChange(movement.id, action);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {movement.referenceNumber || `Movement #${movement.id.slice(0, 8)}`}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                      {movement.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                      {movement.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(movement.priority)}`}>
                      {movement.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Action Buttons */}
                {getAvailableActions().map((action) => (
                  <button
                    key={action.action}
                    onClick={() => handleAction(action.action, action.requiresReason || false)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${action.color}-600 hover:bg-${action.color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${action.color}-500`}
                    style={{
                      backgroundColor: action.color === 'blue' ? '#2563eb' : 
                                     action.color === 'green' ? '#16a34a' : 
                                     action.color === 'orange' ? '#ea580c' : '#dc2626'
                    }}
                  >
                    <action.icon className="w-4 h-4 mr-1" />
                    {action.label}
                  </button>
                ))}

                {canDelete() && (
                  <button
                    onClick={() => onDelete(movement.id)}
                    className="p-2 text-white hover:bg-red-700 rounded-md transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-blue-800 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('lines')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'lines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Lines ({lines.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Tasks ({tasks.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Movement Information</h3>
                  {canEdit() && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  )}
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    {isEditing ? (
                      <select
                        value={editedMovement.type}
                        onChange={(e) => setEditedMovement({ ...editedMovement, type: e.target.value as MovementType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.values(MovementType).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{movement.type}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    {isEditing ? (
                      <select
                        value={editedMovement.priority}
                        onChange={(e) => setEditedMovement({ ...editedMovement, priority: e.target.value as MovementPriority })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.values(MovementPriority).map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{movement.priority}</p>
                    )}
                  </div>

                  {/* Warehouse ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Warehouse ID
                    </label>
                    <p className="text-sm text-gray-900 font-mono">{movement.warehouseId}</p>
                  </div>

                  {/* Movement Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Movement Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(movement.movementDate), 'PPp')}
                    </p>
                  </div>

                  {/* Expected Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Date
                    </label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editedMovement.expectedDate ? new Date(editedMovement.expectedDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditedMovement({ ...editedMovement, expectedDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {movement.expectedDate ? format(new Date(movement.expectedDate), 'PPp') : 'N/A'}
                      </p>
                    )}
                  </div>

                  {/* Scheduled Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date
                    </label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editedMovement.scheduledDate ? new Date(editedMovement.scheduledDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditedMovement({ ...editedMovement, scheduledDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {movement.scheduledDate ? format(new Date(movement.scheduledDate), 'PPp') : 'N/A'}
                      </p>
                    )}
                  </div>

                  {/* Source Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedMovement.sourceLocationId}
                        onChange={(e) => setEditedMovement({ ...editedMovement, sourceLocationId: e.target.value })}
                        placeholder="Source Location ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 font-mono">{movement.sourceLocationId || 'N/A'}</p>
                    )}
                  </div>

                  {/* Destination Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedMovement.destinationLocationId}
                        onChange={(e) => setEditedMovement({ ...editedMovement, destinationLocationId: e.target.value })}
                        placeholder="Destination Location ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 font-mono">{movement.destinationLocationId || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedMovement.notes}
                      onChange={(e) => setEditedMovement({ ...editedMovement, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter any notes or comments..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{movement.notes || 'No notes'}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="border-t pt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-sm text-gray-900">{format(new Date(movement.createdAt), 'PPp')}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Created By</label>
                    <p className="text-sm text-gray-900 font-mono">{movement.createdBy}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Updated At</label>
                    <p className="text-sm text-gray-900">{format(new Date(movement.updatedAt), 'PPp')}</p>
                  </div>
                  {movement.completedAt && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Completed At</label>
                      <p className="text-sm text-gray-900">{format(new Date(movement.completedAt), 'PPp')}</p>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Progress Overview</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{movement.totalLines || 0}</div>
                      <div className="text-sm text-gray-600">Total Lines</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{movement.completedLines || 0}</div>
                      <div className="text-sm text-gray-600">Completed Lines</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">{movement.pendingTasks || 0}</div>
                      <div className="text-sm text-gray-600">Pending Tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lines Tab */}
            {activeTab === 'lines' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Movement Lines</h3>
                  {canEdit() && (
                    <button
                      onClick={() => setIsAddingLine(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line
                    </button>
                  )}
                </div>

                {isAddingLine && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <MovementLineForm
                      movementId={movement.id}
                      onSuccess={handleLineAdded}
                      onCancel={() => setIsAddingLine(false)}
                    />
                  </div>
                )}

                {lines.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No lines</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a line to this movement.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lines.map((line) => (
                      <div key={line.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">Line #{line.lineNumber}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                line.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                line.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                                line.status === 'PICKED' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {line.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Item ID:</span>
                                <span className="ml-2 font-mono text-gray-900">{line.itemId}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Requested Qty:</span>
                                <span className="ml-2 font-medium text-gray-900">{line.requestedQuantity} {line.uom}</span>
                              </div>
                              {line.actualQuantity !== null && line.actualQuantity !== undefined && (
                                <div>
                                  <span className="text-gray-500">Actual Qty:</span>
                                  <span className="ml-2 font-medium text-gray-900">{line.actualQuantity} {line.uom}</span>
                                </div>
                              )}
                              {line.fromLocationId && (
                                <div>
                                  <span className="text-gray-500">From:</span>
                                  <span className="ml-2 font-mono text-gray-900">{line.fromLocationId}</span>
                                </div>
                              )}
                              {line.toLocationId && (
                                <div>
                                  <span className="text-gray-500">To:</span>
                                  <span className="ml-2 font-mono text-gray-900">{line.toLocationId}</span>
                                </div>
                              )}
                            </div>
                            {line.notes && (
                              <div className="mt-2 text-sm text-gray-600 italic">{line.notes}</div>
                            )}
                          </div>
                          {canEdit() && (
                            <button
                              onClick={() => handleLineDeleted(line.id)}
                              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Movement Tasks</h3>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                    <p className="mt-1 text-sm text-gray-500">Tasks will be created automatically or can be added manually.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <MovementTaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleTaskUpdated}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementDetailModal;