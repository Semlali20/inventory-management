import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, MapPin, Calendar, TrendingUp, MoreVertical, 
  PlayCircle, CheckCircle, XCircle, Edit, Trash2, Eye, 
  Pause, ArrowUpCircle 
} from 'lucide-react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getStatusColor = (status: MovementStatus) => {
    const colors = {
      [MovementStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200',
      [MovementStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
      [MovementStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
      [MovementStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
      [MovementStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
      [MovementStatus.ON_HOLD]: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeIcon = (type: MovementType) => {
    return <Package className="w-5 h-5" />;
  };

  const getTypeColor = (type: MovementType) => {
    const colors = {
      [MovementType.INBOUND]: 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-200',
      [MovementType.OUTBOUND]: 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200',
      [MovementType.TRANSFER]: 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-200',
      [MovementType.ADJUSTMENT]: 'text-purple-600 bg-purple-50 dark:bg-purple-900 dark:text-purple-200',
      [MovementType.RETURN]: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200',
      [MovementType.RECEIPT]: 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-200',
      [MovementType.SHIPMENT]: 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityIndicator = (priority: MovementPriority) => {
    if (priority === MovementPriority.HIGH || priority === MovementPriority.URGENT) {
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

  // Get available actions based on movement status
  const getAvailableActions = () => {
    const actions = [];
    
    // View action - always available
    actions.push({
      label: 'View Details',
      icon: Eye,
      action: 'view',
      color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900',
    });

    // Edit action - only for DRAFT and PENDING
    if ([MovementStatus.DRAFT, MovementStatus.PENDING].includes(movement.status)) {
      actions.push({
        label: 'Edit',
        icon: Edit,
        action: 'edit',
        color: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
      });
    }

    // Start action - only for PENDING and DRAFT
    if ([MovementStatus.PENDING, MovementStatus.DRAFT].includes(movement.status)) {
      actions.push({
        label: 'Start Movement',
        icon: PlayCircle,
        action: 'start',
        color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900',
      });
    }

    // Complete action - only for IN_PROGRESS
    if (movement.status === MovementStatus.IN_PROGRESS) {
      actions.push({
        label: 'Complete',
        icon: CheckCircle,
        action: 'complete',
        color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900',
      });
    }

    // Hold action - only for IN_PROGRESS and PENDING
    if ([MovementStatus.IN_PROGRESS, MovementStatus.PENDING].includes(movement.status)) {
      actions.push({
        label: 'Put on Hold',
        icon: Pause,
        action: 'hold',
        color: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900',
        requiresReason: true,
      });
    }

    // Release action - only for ON_HOLD
    if (movement.status === MovementStatus.ON_HOLD) {
      actions.push({
        label: 'Release from Hold',
        icon: ArrowUpCircle,
        action: 'release',
        color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900',
      });
    }

    // Cancel action - for PENDING, IN_PROGRESS, ON_HOLD
    if ([MovementStatus.PENDING, MovementStatus.IN_PROGRESS, MovementStatus.ON_HOLD].includes(movement.status)) {
      actions.push({
        label: 'Cancel Movement',
        icon: XCircle,
        action: 'cancel',
        color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900',
        requiresReason: true,
      });
    }

    // Delete action - only for DRAFT and CANCELLED
    if ([MovementStatus.DRAFT, MovementStatus.CANCELLED].includes(movement.status)) {
      actions.push({
        label: 'Delete',
        icon: Trash2,
        action: 'delete',
        color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900',
      });
    }

    return actions;
  };

  const handleActionClick = (action: string, requiresReason?: boolean) => {
    setShowDropdown(false);

    if (action === 'view' || action === 'edit') {
      onClick();
      return;
    }

    if (action === 'delete') {
      onDelete(movement.id);
      return;
    }

    if (requiresReason) {
      const reason = window.prompt(`Please provide a reason for ${action}:`);
      if (reason && reason.trim()) {
        onStatusChange(movement.id, action, reason);
      }
    } else {
      onStatusChange(movement.id, action);
    }
  };

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      {/* Priority Indicator */}
      {getPriorityIndicator(movement.priority)}

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${getTypeColor(movement.type)}`}>
                {getTypeIcon(movement.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {movement.referenceNumber || `Movement #${movement.id.slice(0, 8)}`}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {movement.type}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(movement.status)}`}>
            {movement.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(movement.movementDate), 'MMM dd, yyyy HH:mm')}
          </div>

          {movement.sourceLocationId && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              <div className="flex items-center">
                <span className="font-medium mr-2">From:</span>
                <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {movement.sourceLocationId.slice(0, 8)}...
                </div>
              </div>
            </div>
          )}

          {movement.destinationLocationId && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              <div className="flex items-center">
                <span className="font-medium mr-2">To:</span>
                <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {movement.destinationLocationId.slice(0, 8)}...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ FIXED: Progress Bar - Only show when movement has lines */}
        {movement.totalLines && movement.totalLines > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {movement.completedLines || 0} / {movement.totalLines} lines completed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
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
            <div className="text-xs text-gray-500 dark:text-gray-400 italic truncate max-w-xs">
              {movement.notes}
            </div>
          )}
        </div>
      </div>

      {/* 3-Dot Dropdown Menu */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
            {getAvailableActions().map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(action.action, action.requiresReason);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 ${action.color} dark:text-gray-200 transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementCard;