import React from 'react';
import { Package, MapPin, Calendar, TrendingUp, MoreVertical, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { Movement, MovementStatus, MovementType, MovementPriority } from '../../types';
import { format } from 'date-fns';

interface MovementCardProps {
  movement: Movement;
  onClick: () => void;
  onStatusChange: (movementId: string, action: string, reason?: string) => void;
  onDelete: (movementId: string) => void;
}

const MovementCard: React.FC<MovementCardProps> = ({
  movement,
  onClick,
  onStatusChange,
  onDelete
}) => {
  const getStatusColor = (status: MovementStatus) => {
    const colors = {
      [MovementStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300',
      [MovementStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [MovementStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-300',
      [MovementStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-300',
      [MovementStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
      [MovementStatus.ON_HOLD]: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeIcon = (type: MovementType) => {
    return <Package className="w-5 h-5" />;
  };

  const getTypeColor = (type: MovementType) => {
    const colors = {
      [MovementType.INBOUND]: 'text-green-600 bg-green-50',
      [MovementType.OUTBOUND]: 'text-red-600 bg-red-50',
      [MovementType.TRANSFER]: 'text-blue-600 bg-blue-50',
      [MovementType.ADJUSTMENT]: 'text-purple-600 bg-purple-50',
      [MovementType.RETURN]: 'text-yellow-600 bg-yellow-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityIndicator = (priority: MovementPriority) => {
    if (priority === MovementPriority.HIGH) {
      return <div className="w-1 h-full bg-red-500 absolute left-0 top-0 rounded-l-lg" />;
    } else if (priority === MovementPriority.NORMAL) {
      return <div className="w-1 h-full bg-blue-500 absolute left-0 top-0 rounded-l-lg" />;
    }
    return <div className="w-1 h-full bg-gray-300 absolute left-0 top-0 rounded-l-lg" />;
  };

  const getCompletionPercentage = () => {
    if (!movement.totalLines || movement.totalLines === 0) return 0;
    return Math.round(((movement.completedLines || 0) / movement.totalLines) * 100);
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {getPriorityIndicator(movement.priority)}

      <div className="p-6 pl-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTypeColor(movement.type)}`}>
              {getTypeIcon(movement.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {movement.referenceNumber || `Movement #${movement.id.slice(0, 8)}`}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(movement.status)}`}>
                  {movement.status}
                </span>
                <span className="text-xs text-gray-500">{movement.type}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {movement.priority === MovementPriority.HIGH && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                High Priority
              </span>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Movement Date</div>
              <div className="font-medium text-gray-900">
                {format(new Date(movement.movementDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          {movement.sourceLocationId && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Source</div>
                <div className="font-medium text-gray-900 truncate" title={movement.sourceLocationId}>
                  {movement.sourceLocationId.slice(0, 8)}...
                </div>
              </div>
            </div>
          )}

          {movement.destinationLocationId && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Destination</div>
                <div className="font-medium text-gray-900 truncate" title={movement.destinationLocationId}>
                  {movement.destinationLocationId.slice(0, 8)}...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {movement.totalLines && movement.totalLines > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {movement.completedLines || 0} / {movement.totalLines} lines completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-1" />
              {movement.totalLines || 0} Lines
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {movement.pendingTasks || 0} Tasks
            </div>
          </div>

          {movement.notes && (
            <div className="text-xs text-gray-500 italic truncate max-w-xs">
              {movement.notes}
            </div>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Quick actions menu
          }}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default MovementCard;