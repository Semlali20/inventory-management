// frontend/src/pages/movements/MovementsPage.tsx
// ✅ COMPLETE VERSION WITH INVENTORY INTEGRATION

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, Package } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { inventoryService } from '@/services/inventory.service';
import { qualityService } from '@/services/quality.service';
import { alertService } from '@/services/alert.service';
import { Movement, MovementType, MovementStatus } from '@/types';
import { toast } from 'react-hot-toast';
import MovementFormModal from '@/components/movements/MovementFormModal';
import MovementDetailModal from '@/components/movements/MovementDetailModal';
import MovementCard from '@/components/movements/Movementcard';

const MovementsPage = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Fetch movements
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await movementService.getMovements({ size: 100 });
      setMovements(response.content || []);
      console.log('✅ Movements loaded:', response.content?.length);
    } catch (error) {
      console.error('❌ Failed to fetch movements:', error);
      toast.error('Failed to load movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Filter movements
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = movement.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || movement.type === filters.type;
    const matchesStatus = !filters.status || movement.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateMovement = () => {
    setIsCreateModalOpen(true);
  };

  const handleMovementCreated = () => {
    fetchMovements();
  };

  const handleMovementClick = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsDetailModalOpen(true);
  };

  const handleMovementUpdated = () => {
    fetchMovements();
  };

  // ✅ COMPLETE: Handle status change with inventory updates
  const handleStatusChange = async (movementId: string, newStatus: MovementStatus) => {
    try {
      setLoading(true);
      
      console.log(`🔄 Updating movement ${movementId} to status: ${newStatus}`);
      
      // Update movement status
      await movementService.updateMovementStatus(movementId, newStatus);
      
      // ✅ If status is COMPLETED, trigger all integrations
      if (newStatus === MovementStatus.COMPLETED) {
        const movement = movements.find(m => m.id === movementId);
        
        if (movement) {
          console.log('🎯 Movement completed, triggering integrations...');
          
          // Get all lines for this movement
          const lines = await movementService.getLinesByMovement(movementId);
          console.log(`📦 Processing ${lines.length} lines`);
          
          // Process each line
          for (const line of lines) {
            try {
              // ✅ Update inventory at source location (decrease stock)
              if (line.fromLocationId) {
                await inventoryService.adjustInventory({
                  itemId: line.itemId,
                  locationId: line.fromLocationId,
                  quantityChange: -(line.actualQuantity || line.requestedQuantity),
                  reason: `Movement ${movement.referenceNumber} completed - stock out`
                });
                console.log(`✅ Decreased stock at source: ${line.fromLocationId}`);
              }
              
              // ✅ Update inventory at destination location (increase stock)
              if (line.toLocationId) {
                await inventoryService.adjustInventory({
                  itemId: line.itemId,
                  locationId: line.toLocationId,
                  quantityChange: (line.actualQuantity || line.requestedQuantity),
                  reason: `Movement ${movement.referenceNumber} completed - stock in`
                });
                console.log(`✅ Increased stock at destination: ${line.toLocationId}`);
              }
              
              // ✅ Check for low stock and create alert
              if (line.fromLocationId) {
                const remaining = await inventoryService.getAvailableQuantity(
                  line.itemId,
                  line.fromLocationId
                );
                
                console.log(`📊 Remaining stock: ${remaining}`);
                
                // Threshold = 10 units
                if (remaining < 10) {
                  await alertService.createAlert({
                    type: 'LOW_STOCK',
                    severity: remaining < 5 ? 'CRITICAL' : 'HIGH',
                    title: 'Low Stock Alert',
                    message: `Item ${line.itemName || line.itemId} is low in stock (${remaining} remaining)`,
                    itemId: line.itemId,
                    locationId: line.fromLocationId
                  });
                  console.log('⚠️ Low stock alert created');
                  toast.warning(`Low stock alert created for item ${line.itemName || line.itemId}`);
                }
              }
              
            } catch (error) {
              console.error(`❌ Failed to update inventory for line ${line.id}:`, error);
            }
          }
          
          // ✅ Create quality control for INBOUND movements
          if (newStatus === MovementStatus.COMPLETED && movement.type === MovementType.RECEIPT) {
            try {
              console.log('🔍 Creating quality control for RECEIPT movement');
              
              await qualityService.createQualityControl({
                itemId: line.itemId,
                locationId: line.toLocationId,
                quantity: line.actualQuantity,
                status: 'PENDING',
                priority: 'MEDIUM',
                inspectionType: 'RECEIVING',
                scheduledDate: new Date().toISOString(),
                notes: `Auto-created from movement ${movement.referenceNumber}`
              });
              
              console.log('✅ Quality control created');
            } catch (error) {
              console.error('❌ Failed to create quality control:', error);
            }
          }
          
          toast.success('✅ Movement completed! Inventory updated and checks initiated.');
        }
      } else {
        toast.success(`Movement status updated to ${newStatus}`);
      }
      
      // Refresh movements
      await fetchMovements();
      
    } catch (error: any) {
      console.error('❌ Status change error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movementId: string) => {
    if (!window.confirm('Are you sure you want to delete this movement?')) {
      return;
    }

    try {
      await movementService.deleteMovement(movementId);
      toast.success('Movement deleted successfully');
      fetchMovements();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete movement');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Movements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage inbound, outbound, and transfer movements
          </p>
        </div>
        <button
          onClick={handleCreateMovement}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Movement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Movements</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{movements.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Draft</div>
          <div className="text-2xl font-bold text-yellow-600">
            {movements.filter(m => m.status === MovementStatus.DRAFT).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {movements.filter(m => m.status === MovementStatus.IN_PROGRESS).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {movements.filter(m => m.status === MovementStatus.COMPLETED).length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by reference or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value={MovementType.INBOUND}>Inbound</option>
            <option value={MovementType.OUTBOUND}>Outbound</option>
            <option value={MovementType.TRANSFER}>Transfer</option>
            <option value={MovementType.ADJUSTMENT}>Adjustment</option>
            <option value={MovementType.RETURN}>Return</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value={MovementStatus.DRAFT}>Draft</option>
            <option value={MovementStatus.PENDING}>Pending</option>
            <option value={MovementStatus.IN_PROGRESS}>In Progress</option>
            <option value={MovementStatus.COMPLETED}>Completed</option>
            <option value={MovementStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Movements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No movements found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filters.type || filters.status
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new movement'}
            </p>
            {!searchTerm && !filters.type && !filters.status && (
              <div className="mt-6">
                <button
                  onClick={handleCreateMovement}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Movement
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMovements.map((movement) => (
              <MovementCard
                key={movement.id}
                movement={movement}
                onClick={() => handleMovementClick(movement)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedMovement && (
        <MovementDetailModal
          movement={selectedMovement}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedMovement(null);
          }}
          onUpdate={handleMovementUpdated}
        />
      )}

      {isCreateModalOpen && (
        <MovementFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleMovementCreated}
        />
      )}
    </div>
  );
};

export default MovementsPage;