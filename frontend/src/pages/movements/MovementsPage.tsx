import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, ArrowUpDown, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { Movement, MovementStatus, MovementType, MovementPriority } from '@/types';
import MovementDetailModal from '@/components/movements/MovementDetailModal';
//import CreateMovementModal from '@/components/movements/Createmovementmodal';
import { MovementFormModal } from '@/components/movements/MovementFormModal';
import MovementCard from '@/components/movements/Movementcard';
import MovementFilters from '@/components/movements/Movementfilters';
import { toast } from 'react-hot-toast';

interface MovementStats {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
}

const MovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<MovementStats>({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    type: '' as MovementType | '',
    status: '' as MovementStatus | '',
    priority: '' as MovementPriority | '',
    warehouseId: '',
    startDate: '',
    endDate: ''
  });

  const [sortBy, setSortBy] = useState<'createdAt' | 'movementDate' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchMovements();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [movements, searchTerm, filters, sortBy, sortOrder]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await movementService.getMovements();
      const movementsData = response.content || [];
      setMovements(movementsData);
      calculateStats(movementsData);
    } catch (error: any) {
      console.error('Error fetching movements:', error);
      toast.error(error.message || 'Failed to fetch movements');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (movementsData: Movement[]) => {
    const stats = {
      total: movementsData.length,
      inProgress: movementsData.filter(m => m.status === MovementStatus.IN_PROGRESS).length,
      completed: movementsData.filter(m => m.status === MovementStatus.COMPLETED).length,
      pending: movementsData.filter(m => m.status === MovementStatus.PENDING).length
    };
    setStats(stats);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...movements];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(movement =>
        movement.referenceNumber?.toLowerCase().includes(search) ||
        movement.notes?.toLowerCase().includes(search) ||
        movement.id.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(m => m.priority === filters.priority);
    }

    // Warehouse filter
    if (filters.warehouseId) {
      filtered = filtered.filter(m => m.warehouseId === filters.warehouseId);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(m => new Date(m.movementDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(m => new Date(m.movementDate) <= new Date(filters.endDate));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'movementDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMovements(filtered);
  };

  const handleMovementClick = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsDetailModalOpen(true);
  };

  const handleCreateMovement = () => {
    setIsCreateModalOpen(true);
  };

  const handleMovementCreated = () => {
    setIsCreateModalOpen(false);
    fetchMovements();
  };

  const handleMovementUpdated = () => {
    fetchMovements();
  };

  const handleStatusChange = async (movementId: string, action: string, reason?: string) => {
    try {
      let response;
      switch (action) {
        case 'start':
          response = await movementService.startMovement(movementId);
          toast.success('Movement started successfully');
          break;
        case 'complete':
          response = await movementService.completeMovement(movementId);
          toast.success('Movement completed successfully');
          break;
        case 'cancel':
          if (!reason) {
            toast.error('Cancellation reason is required');
            return;
          }
          response = await movementService.cancelMovement(movementId, reason);
          toast.success('Movement cancelled successfully');
          break;
        case 'hold':
          if (!reason) {
            toast.error('Hold reason is required');
            return;
          }
          response = await movementService.holdMovement(movementId, reason);
          toast.success('Movement put on hold');
          break;
        case 'release':
          response = await movementService.releaseMovement(movementId);
          toast.success('Movement released from hold');
          break;
        default:
          toast.error('Invalid action');
          return;
      }
      
      fetchMovements();
      if (selectedMovement?.id === movementId) {
        setSelectedMovement(response.data);
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.message || `Failed to ${action} movement`);
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
      if (selectedMovement?.id === movementId) {
        setIsDetailModalOpen(false);
        setSelectedMovement(null);
      }
    } catch (error: any) {
      console.error('Error deleting movement:', error);
      toast.error(error.message || 'Failed to delete movement');
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      priority: '',
      warehouseId: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
  };

  const toggleSort = (field: 'createdAt' | 'movementDate' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Movement Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all stock movements across your warehouses
              </p>
            </div>
            <button
              onClick={handleCreateMovement}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Movement
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Movements</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-2xl font-semibold text-blue-600">{stats.inProgress}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-2xl font-semibold text-yellow-600">{stats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-2xl font-semibold text-green-600">{stats.completed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search movements by reference, ID, or notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  showFilters
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>

              <button
                onClick={fetchMovements}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => toggleSort('createdAt')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowUpDown className="w-5 h-5 mr-2" />
                Sort
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <MovementFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </div>

      {/* Movements List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No movements found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filters.type || filters.status
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new movement'}
            </p>
            {!searchTerm && !filters.type && !filters.status && (
              <div className="mt-6">
                <button
                  onClick={handleCreateMovement}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
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