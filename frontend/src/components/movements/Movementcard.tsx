// frontend/src/components/movements/MovementCard.tsx
// ✅ COMPLETE CARD COMPONENT WITH ENRICHED DISPLAY

import { Package, MapPin, Calendar, MoreVertical, Trash2 } from 'lucide-react';
import { Movement, MovementStatus, MovementType } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';

interface MovementCardProps {
  movement: Movement;
  onClick: () => void;
  onStatusChange: (id: string, status: MovementStatus) => void;
  onDelete: (id: string) => void;
}

const MovementCard = ({ movement, onClick, onStatusChange, onDelete }: MovementCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: MovementStatus) => {
    switch (status) {
      case MovementStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case MovementStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case MovementStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case MovementStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case MovementStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: MovementType) => {
    switch (type) {
      case MovementType.RECEIPT:
        return '📥';
      case MovementType.ISSUE:
        return '📤';
      case MovementType.TRANSFER:
        return '🔄';
      case MovementType.PICKING:
        return '📦';
      case MovementType.PUTAWAY:
        return '🏪';
      case MovementType.RETURN:
        return '↩️';
      case MovementType.ADJUSTMENT:
        return '⚖️';
      case MovementType.CYCLE_COUNT:
        return '🔢';
      case MovementType.RELOCATION:
        return '🔄';
      case MovementType.QUARANTINE:
        return '🚫';
      default:
        return '📦';
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{getTypeIcon(movement.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {movement.referenceNumber || `Movement #${movement.id.slice(0, 8)}`}
              </h3>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(movement.status)}`}>
                {movement.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Type: {movement.type}</span>
            </div>
            
            {(movement.sourceLocationName || movement.sourceLocationId) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>From: {movement.sourceLocationName || movement.sourceLocationId}</span>
              </div>
            )}
            
            {(movement.destinationLocationName || movement.destinationLocationId) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>To: {movement.destinationLocationName || movement.destinationLocationId}</span>
              </div>
            )}

            {movement.warehouseName && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Warehouse: {movement.warehouseName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {movement.movementDate 
                  ? format(new Date(movement.movementDate), 'PPp')
                  : 'No date'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Lines: {movement.totalLines || movement.lines?.length || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Tasks: {movement.pendingTasks || movement.tasks?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              {movement.status === MovementStatus.DRAFT && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(movement.id, MovementStatus.IN_PROGRESS);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  Start Movement
                </button>
              )}
              {movement.status === MovementStatus.IN_PROGRESS && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(movement.id, MovementStatus.COMPLETED);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  Complete Movement
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(movement.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementCard;