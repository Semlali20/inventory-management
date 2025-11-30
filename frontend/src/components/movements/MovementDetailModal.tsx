// frontend/src/components/movements/MovementDetailModal.tsx
// ✅ UPDATED WITH ACTION BUTTONS FOR LINES AND TASKS

import { useState, useEffect } from 'react';
import { X, Edit, Trash2, Package, MapPin, Calendar, User, CheckCircle, XCircle, Clock, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { Movement, MovementLine, MovementTask, MovementStatus, LineStatus, TaskStatus } from '@/types';
import { toast } from 'react-hot-toast';

interface MovementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement;
  onUpdate: () => void;
}

const MovementDetailModal = ({ isOpen, onClose, movement: initialMovement, onUpdate }: MovementDetailModalProps) => {
  const [movement, setMovement] = useState<Movement>(initialMovement);
  const [lines, setLines] = useState<MovementLine[]>([]);
  const [tasks, setTasks] = useState<MovementTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'tasks'>('details');

  // State for editing actual quantity
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingActualQty, setEditingActualQty] = useState<number>(0);

  // Enriched data for display names
  const [enrichedData, setEnrichedData] = useState<{
    items: Map<string, any>;
    locations: Map<string, any>;
  }>({
    items: new Map(),
    locations: new Map(),
  });

  useEffect(() => {
    if (isOpen) {
      fetchMovementDetails();
      fetchLines();
      fetchTasks();
    }
  }, [isOpen, movement.id]);

  const enrichLineData = async (linesToEnrich: MovementLine[]) => {
    const newItemsMap = new Map(enrichedData.items);
    const newLocationsMap = new Map(enrichedData.locations);

    for (const line of linesToEnrich) {
      // Fetch item details
      if (line.itemId && !newItemsMap.has(line.itemId)) {
        try {
          const item = await productService.getItemById(line.itemId);
          newItemsMap.set(line.itemId, {
            name: item.name,
            sku: item.sku,
            code: item.code
          });
        } catch (error) {
          console.error('Error fetching item:', error);
          newItemsMap.set(line.itemId, {
            name: 'Unknown Item',
            sku: line.itemId.slice(0, 8)
          });
        }
      }

      // Fetch location details
      for (const locId of [line.fromLocationId, line.toLocationId]) {
        if (locId && !newLocationsMap.has(locId)) {
          try {
            const location = await locationService.getLocationById(locId);
            newLocationsMap.set(locId, {
              code: location.code,
              zone: location.zone,
              aisle: location.aisle
            });
          } catch (error) {
            console.error('Error fetching location:', error);
            newLocationsMap.set(locId, {
              code: locId.slice(0, 8)
            });
          }
        }
      }
    }

    setEnrichedData({
      items: newItemsMap,
      locations: newLocationsMap
    });
  };

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
      const linesData = await movementService.getLinesByMovement(movement.id);
      setLines(linesData);
      await enrichLineData(linesData);
    } catch (error: any) {
      console.error('Error fetching movement lines:', error);
      toast.error('Failed to fetch movement lines');
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksData = await movementService.getTasksByMovement(movement.id);
      setTasks(tasksData);
    } catch (error: any) {
      console.error('Error fetching movement tasks:', error);
      toast.error('Failed to fetch movement tasks');
    }
  };

  // Handler to update actual quantity
  const handleUpdateActualQuantity = async (lineId: string, newQuantity: number) => {
    try {
      setLoading(true);
      await movementService.updateLineActualQuantity(lineId, newQuantity);
      
      const item = lines.find(l => l.id === lineId);
      const itemData = item ? enrichedData.items.get(item.itemId) : null;
      const itemName = itemData?.name || itemData?.sku || 'Item';
      
      toast.success(`✅ ${itemName}: Actual quantity updated to ${newQuantity}`);
      setEditingLineId(null);
      fetchLines();
    } catch (error: any) {
      console.error('Error updating actual quantity:', error);
      toast.error(error.message || 'Failed to update actual quantity');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Complete individual movement line
  const handleCompleteMovementLine = async (lineId: string) => {
    if (!window.confirm('Are you sure you want to complete this line?')) return;
    
    try {
      setLoading(true);
      await movementService.completeMovementLine(lineId);
      
      const item = lines.find(l => l.id === lineId);
      const itemData = item ? enrichedData.items.get(item.itemId) : null;
      const itemName = itemData?.name || itemData?.sku || 'Item';
      
      toast.success(`✅ ${itemName}: Line completed successfully`);
      fetchLines();
      fetchMovementDetails(); // Refresh movement status
    } catch (error: any) {
      console.error('Error completing line:', error);
      toast.error(error.message || 'Failed to complete line');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    if (!window.confirm('Are you sure you want to delete this line?')) return;
    
    try {
      setLoading(true);
      await movementService.deleteMovementLine(lineId);
      toast.success('✅ Line deleted successfully');
      fetchLines();
    } catch (error: any) {
      console.error('Error deleting line:', error);
      toast.error(error.message || 'Failed to delete line');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Task action handlers - for individual task management
  const handleStartTask = async (taskId: string) => {
    try {
      setLoading(true);
      await movementService.startTask(taskId);
      toast.success('✅ Task started');
      fetchTasks();
    } catch (error: any) {
      console.error('Error starting task:', error);
      toast.error(error.message || 'Failed to start task');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      await movementService.completeTask(taskId);
      toast.success('✅ Task completed successfully');
      fetchTasks();
      fetchMovementDetails(); // Refresh movement status
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    try {
      setLoading(true);
      await movementService.cancelTask(taskId, reason);
      toast.success('✅ Task cancelled');
      fetchTasks();
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error(error.message || 'Failed to cancel task');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      await movementService.startMovement(movement.id);
      toast.success('✅ Movement started successfully!');
      fetchMovementDetails();
      onUpdate();
    } catch (error: any) {
      console.error('Error starting movement:', error);
      toast.error(error.message || 'Failed to start movement');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await movementService.completeMovement(movement.id);
      toast.success('✅ Movement completed successfully!');
      
      toast.loading('📊 Updating inventory...', { duration: 2000 });
      
      setTimeout(async () => {
        for (const line of lines) {
          try {
            const targetLocationId = line.toLocationId || line.fromLocationId;
            if (!targetLocationId) continue;

            const inventory = await inventoryService.getInventoryByItemAndLocation(
              line.itemId,
              targetLocationId
            );
            
            const itemData = enrichedData.items.get(line.itemId);
            const itemName = itemData?.name || itemData?.sku || line.itemId.slice(0, 8);
            
            toast.success(
              `✅ ${itemName}: ${inventory.quantityOnHand} units on hand (${inventory.availableQuantity} available)`,
              { duration: 5000 }
            );
          } catch (err) {
            console.warn('Could not fetch inventory update:', err);
          }
        }
        
        toast.success('✅ All inventory records updated!', { duration: 3000 });
      }, 2500);
      
      fetchMovementDetails();
      onUpdate();
    } catch (error: any) {
      console.error('Error completing movement:', error);
      toast.error(error.message || 'Failed to complete movement');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    try {
      setLoading(true);
      await movementService.cancelMovement(movement.id, reason);
      toast.success('✅ Movement cancelled successfully');
      fetchMovementDetails();
      onUpdate();
    } catch (error: any) {
      console.error('Error cancelling movement:', error);
      toast.error(error.message || 'Failed to cancel movement');
    } finally {
      setLoading(false);
    }
  };

  const handleHold = async () => {
    const reason = window.prompt('Please provide a reason for holding:');
    if (!reason) return;
    
    try {
      setLoading(true);
      await movementService.holdMovement(movement.id, reason);
      toast.success('✅ Movement put on hold');
      fetchMovementDetails();
      onUpdate();
    } catch (error: any) {
      console.error('Error holding movement:', error);
      toast.error(error.message || 'Failed to hold movement');
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    try {
      setLoading(true);
      await movementService.releaseMovement(movement.id);
      toast.success('✅ Movement released from hold');
      fetchMovementDetails();
      onUpdate();
    } catch (error: any) {
      console.error('Error releasing movement:', error);
      toast.error(error.message || 'Failed to release movement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MovementStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (movement.status === 'DRAFT' || movement.status === 'PENDING') {
      actions.push({ label: 'Start', action: handleStart, icon: Play, color: 'blue' });
    }
    
    if (movement.status === 'IN_PROGRESS' || movement.status === 'PARTIALLY_COMPLETED') {
      actions.push({ label: 'Complete', action: handleComplete, icon: CheckCircle, color: 'green' });
      actions.push({ label: 'Hold', action: handleHold, icon: Pause, color: 'orange' });
    }
    
    if (movement.status === 'ON_HOLD') {
      actions.push({ label: 'Release', action: handleRelease, icon: RotateCcw, color: 'blue' });
    }
    
    if (movement.status !== 'COMPLETED' && movement.status !== 'CANCELLED') {
      actions.push({ label: 'Cancel', action: handleCancel, icon: XCircle, color: 'red' });
    }
    
    return actions;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="relative px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {movement.referenceNumber || `Movement #${movement.id.slice(0, 8)}`}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                  {movement.status}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  {movement.type}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  {movement.priority} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 mt-4">
            {getAvailableActions().map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.action}
                  disabled={loading}
                  className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50`}
                  style={{
                    backgroundColor: action.color === 'blue' ? '#2563eb' : 
                                   action.color === 'green' ? '#16a34a' : 
                                   action.color === 'orange' ? '#ea580c' :
                                   action.color === 'red' ? '#dc2626' : '#6b7280'
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {['details', 'lines', 'tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab}
              {tab === 'lines' && ` (${lines.length})`}
              {tab === 'tasks' && ` (${tasks.length})`}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <p className="text-gray-900 dark:text-white">{movement.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <p className="text-gray-900 dark:text-white">{movement.priority}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                    {movement.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Number</label>
                  <p className="text-gray-900 dark:text-white">{movement.referenceNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created At</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(movement.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {movement.expectedDate ? new Date(movement.expectedDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {movement.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    {movement.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* LINES TAB */}
          {activeTab === 'lines' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Movement Lines ({lines.length})
                </h3>
              </div>

              {lines.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No lines</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This movement has no lines yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actual</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {lines.map((line) => {
                        const itemData = enrichedData.items.get(line.itemId);
                        const fromLocData = line.fromLocationId ? enrichedData.locations.get(line.fromLocationId) : null;
                        const toLocData = line.toLocationId ? enrichedData.locations.get(line.toLocationId) : null;
                        const variance = line.actualQuantity !== null ? line.actualQuantity - line.requestedQuantity : null;
                        
                        return (
                          <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {itemData?.name || 'Loading...'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {itemData?.sku || line.itemId.slice(0, 8)}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {fromLocData?.code || line.fromLocationId?.slice(0, 8) || 'N/A'}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {toLocData?.code || line.toLocationId?.slice(0, 8) || 'N/A'}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {line.requestedQuantity} {line.uom}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {editingLineId === line.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editingActualQty}
                                    onChange={(e) => setEditingActualQty(Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                                    min="0"
                                  />
                                  <button
                                    onClick={() => handleUpdateActualQuantity(line.id, editingActualQty)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingLineId(null)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{line.actualQuantity ?? '-'} {line.actualQuantity !== null ? line.uom : ''}</span>
                                  {movement.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() => {
                                        setEditingLineId(line.id);
                                        setEditingActualQty(line.actualQuantity ?? line.requestedQuantity);
                                      }}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              {variance !== null ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  Number(variance) > 0
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {Number(variance) > 0 ? '+' : ''}{variance}
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">-</span>
                              )}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                line.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : line.status === LineStatus.IN_TRANSIT
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {line.status}
                              </span>
                            </td>
                            
                            {/* ✅ NEW: ACTIONS COLUMN WITH COMPLETE BUTTON */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                {/* Complete Line Button - Only show if movement is completed or line is not completed */}
                                {movement.status === 'COMPLETED' && line.status !== 'COMPLETED' && (
                                  <button
                                    onClick={() => handleCompleteMovementLine(line.id)}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                                    title="Complete line"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Complete
                                  </button>
                                )}
                                
                                {/* Delete Button - Only show if movement is not completed */}
                                {movement.status !== 'COMPLETED' && (
                                  <button
                                    onClick={() => handleDeleteLine(line.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Delete line"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Movement Tasks ({tasks.length})
                </h3>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This movement has no tasks yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const isOverdue = task.expectedCompletionTime &&
                      new Date(task.expectedCompletionTime) < new Date() &&
                      task.status !== TaskStatus.COMPLETED &&
                      task.status !== TaskStatus.CANCELLED;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${
                          isOverdue ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{task.taskType === 'PICK' ? '📦' : task.taskType === 'PUTAWAY' ? '📥' : '📋'}</span>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {task.taskType}
                              </h4>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                task.status === TaskStatus.COMPLETED
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : task.status === TaskStatus.IN_PROGRESS
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : task.status === TaskStatus.CANCELLED
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {task.status}
                              </span>
                              {isOverdue && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  OVERDUE
                                </span>
                              )}
                            </div>

                            {task.instructions && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.instructions}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              {task.locationId && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{task.locationId.slice(0, 8)}</span>
                                </div>
                              )}
                              {task.assignedUserId && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{task.assignedUserId.slice(0, 8)}</span>
                                </div>
                              )}
                              {task.expectedCompletionTime && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(task.expectedCompletionTime).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ✅ TASK ACTION BUTTONS */}
                          <div className="flex items-center gap-2 ml-4">
                            {/* Start Task Button - Only for PENDING or ASSIGNED tasks */}
                            {(task.status === TaskStatus.PENDING || task.status === TaskStatus.ASSIGNED) && (
                              <button
                                onClick={() => handleStartTask(task.id)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start
                              </button>
                            )}

                            {/* Complete Task Button - Only for IN_PROGRESS tasks */}
                            {task.status === TaskStatus.IN_PROGRESS && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </button>
                            )}

                            {/* Cancel Task Button - For any non-completed/non-cancelled task */}
                            {task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED && (
                              <button
                                onClick={() => handleCancelTask(task.id)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementDetailModal;