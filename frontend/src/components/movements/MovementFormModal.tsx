import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, ArrowRight, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { movementService } from '@/services/movement.service';
import {
  Movement,
  MovementRequestDto,
  MovementType,
  MovementPriority,
  MovementStatus,
  LineStatus,
  TaskType,
} from '@/types';
import { toast } from 'react-hot-toast';

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Movement | null;
}

export const MovementFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: MovementFormModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    type: MovementType.TRANSFER,
    warehouseId: '',
    priority: MovementPriority.NORMAL,
    sourceLocationId: '',
    destinationLocationId: '',
    referenceNumber: '',
    notes: '',
    expectedDate: '',
  });

  // Lines
  const [lines, setLines] = useState<Array<{
    itemId: string;
    requestedQuantity: number;
    uom: string;
    fromLocationId: string;
    toLocationId: string;
    notes: string;
  }>>([]);

  // Tasks
  const [tasks, setTasks] = useState<Array<{
    taskType: TaskType;
    priority: number;
    locationId: string;
    instructions: string;
    scheduledStartTime: string;
  }>>([]);

  // Helper function to get location display name
  const getLocationDisplayName = (location: any): string => {
    if (!location) return 'Unknown';
    const name = location.name || location.locationName || '';
    return name ? `${location.code} - ${name}` : location.code;
  };

  const formatScheduledTime = (dateTimeLocal: string): string | undefined => {
    if (!dateTimeLocal) return undefined;
    
    try {
      const date = new Date(dateTimeLocal);
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date:', dateTimeLocal);
        return undefined;
      }
      
      // Format: YYYY-MM-DDTHH:mm:ss (exactly like Postman example)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      console.log('📅 Date formatted:', dateTimeLocal, '→', formatted);
      
      return formatted;
      
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return undefined;
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchWarehouses(),
        fetchLocations(),
        fetchItems(),
      ]);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load form data');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await locationService.getWarehouses();
      const data = Array.isArray(response) ? response : response?.content || [];
      setWarehouses(data);
      if (data.length === 1 && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
      }
    } catch (error) {
      console.error('❌ Error fetching warehouses:', error);
      toast.error('Failed to load warehouses');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      const data = Array.isArray(response) ? response : response?.content || [];
      setLocations(data);
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      const data = Array.isArray(response) ? response : response?.content || [];
      setItems(data);
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      toast.error('Failed to load items');
    }
  };

  const resetForm = () => {
    setFormData({
      type: MovementType.TRANSFER,
      warehouseId: '',
      priority: MovementPriority.NORMAL,
      sourceLocationId: '',
      destinationLocationId: '',
      referenceNumber: '',
      notes: '',
      expectedDate: '',
    });
    setLines([]);
    setTasks([]);
    setCurrentStep(1);
  };

  const addLine = () => {
    if (items.length === 0) {
      toast.error('❌ No items available');
      return;
    }
    
    const newLine = {
      itemId: items[0].id,
      requestedQuantity: 1,
      uom: 'EA',
      fromLocationId: formData.sourceLocationId || '',
      toLocationId: formData.destinationLocationId || '',
      notes: '',
    };
    setLines([...lines, newLine]);
    console.log('➕ Line added:', newLine);
  };

  const updateLine = (index: number, field: string, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setLines(updatedLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
    console.log(`🗑️ Line ${index + 1} removed`);
  };

  // ✅ FIXED: Auto-fill locationId with destinationLocationId
  const addTask = () => {
    const newTask = {
      taskType: TaskType.PICK,
      priority: 5,
      locationId: formData.destinationLocationId || '',  
      instructions: '',
      scheduledStartTime: '',
    };
    setTasks([...tasks, newTask]);
    console.log('➕ Task added with auto locationId:', formData.destinationLocationId);
  };

  const updateTask = (index: number, field: string, value: any) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
    console.log(`✏️ Task ${index + 1} updated:`, field, '=', value);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    console.log(`🗑️ Task ${index + 1} removed`);
  };

  // ✅ FIXED: Build submit data with proper formatting
  const buildSubmitData = (): MovementRequestDto => {
    console.log('📋 Building submit data...');
    console.log('Current tasks:', tasks);
    
    const submitData: MovementRequestDto = {
      type: formData.type,
      warehouseId: formData.warehouseId,
      priority: formData.priority,
      status: MovementStatus.DRAFT,
      movementDate: new Date().toISOString(),
      sourceLocationId: formData.sourceLocationId || undefined,
      destinationLocationId: formData.destinationLocationId || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      notes: formData.notes || undefined,
      expectedDate: formData.expectedDate ? formatScheduledTime(formData.expectedDate) : undefined,
      
      lines: lines.map((line, index) => ({
        itemId: line.itemId,
        requestedQuantity: line.requestedQuantity,
        uom: line.uom || 'EA',
        fromLocationId: line.fromLocationId || undefined,
        toLocationId: line.toLocationId || undefined,
        status: LineStatus.PENDING,
        lineNumber: index + 1,
        notes: line.notes || undefined,
      })),
      
      // ✅ FIXED: Format tasks exactly like Postman example
      tasks: tasks.length > 0 ? tasks.map((task, index) => {
        const formattedTask: any = {
          taskType: task.taskType,
          priority: task.priority || 5,
        };
        
        // Only add fields if they have values
        if (task.locationId) {
          formattedTask.locationId = task.locationId;
        }
        if (task.instructions) {
          formattedTask.instructions = task.instructions;
        }
        if (task.scheduledStartTime) {
          formattedTask.scheduledStartTime = formatScheduledTime(task.scheduledStartTime);
        }
        
        console.log(`✅ Task ${index + 1} formatted:`, formattedTask);
        return formattedTask;
      }) : [],
    };

    console.log('📦 Final submit data:', JSON.stringify(submitData, null, 2));
    return submitData;
  };

  const validateStep1 = (): boolean => {
    if (!formData.type) {
      toast.error('❌ Please select a movement type');
      return false;
    }
    if (!formData.warehouseId) {
      toast.error('❌ Please select a warehouse');
      return false;
    }
    if (formData.type === MovementType.TRANSFER) {
      if (!formData.sourceLocationId) {
        toast.error('❌ Transfer movements require a FROM location');
        return false;
      }
      if (!formData.destinationLocationId) {
        toast.error('❌ Transfer movements require a TO location');
        return false;
      }
      if (formData.sourceLocationId === formData.destinationLocationId) {
        toast.error('❌ FROM and TO locations must be different');
        return false;
      }
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (lines.length === 0) {
      toast.error('❌ Please add at least one item');
      return false;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.itemId) {
        toast.error(`❌ Line ${i + 1}: Please select an item`);
        return false;
      }
      if (!line.requestedQuantity || line.requestedQuantity <= 0) {
        toast.error(`❌ Line ${i + 1}: Quantity must be greater than 0`);
        return false;
      }
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    // Tasks are optional, just validate if any exist
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (!task.taskType) {
        toast.error(`❌ Task ${i + 1}: Please select a task type`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    console.log('🚀 === STARTING SUBMISSION ===');
    console.log('Tasks count:', tasks.length);
    console.log('Tasks data:', tasks);
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      console.log('❌ Validation failed');
      return;
    }

    const submitData = buildSubmitData();
    
    console.log('📦 === FINAL SUBMIT DATA ===');
    console.log(JSON.stringify(submitData, null, 2));
    console.log('============================');

    setLoading(true);
    try {
      if (initialData) {
        await movementService.updateMovement(initialData.id, submitData);
        toast.success('✅ Movement updated successfully!');
      } else {
        const response = await movementService.createMovement(submitData);
        console.log('✅ Movement created:', response);
        toast.success('✅ Movement created successfully!');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('❌ === ERROR DETAILS ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('======================');
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Failed to save movement';
      
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLocations = locations.filter(
    loc => !formData.warehouseId || loc.warehouseId === formData.warehouseId
  );

  const movementTypes = [
    { value: MovementType.RECEIPT, label: 'Receipt', icon: '📦' },
    { value: MovementType.ISSUE, label: 'Issue', icon: '📤' },
    { value: MovementType.TRANSFER, label: 'Transfer', icon: '🔄' },
    { value: MovementType.ADJUSTMENT, label: 'Adjustment', icon: '⚖️' },
    { value: MovementType.PICKING, label: 'Picking', icon: '🎯' },
    { value: MovementType.PUTAWAY, label: 'Put Away', icon: '📥' },
    { value: MovementType.RETURN, label: 'Return', icon: '↩️' },
    { value: MovementType.CYCLE_COUNT, label: 'Cycle Count', icon: '🔢' },
    { value: MovementType.QUARANTINE, label: 'Quarantine', icon: '⚠️' },
    { value: MovementType.RELOCATION, label: 'Relocation', icon: '📍' },
  ];

  const priorities = [
    { value: MovementPriority.LOW, label: 'Low' },
    { value: MovementPriority.NORMAL, label: 'Normal' },
    { value: MovementPriority.HIGH, label: 'High' },
    { value: MovementPriority.URGENT, label: 'Urgent' },
    { value: MovementPriority.CRITICAL, label: 'Critical' },
  ];

  const taskTypes = [
    { value: TaskType.PICK, label: 'Pick', icon: '📦' },
    { value: TaskType.PUTAWAY, label: 'Put Away', icon: '📥' },
    { value: TaskType.COUNT, label: 'Count', icon: '🔢' },
    { value: TaskType.PACK, label: 'Pack', icon: '📦' },
    { value: TaskType.LOAD, label: 'Load', icon: '🚚' },
    { value: TaskType.UNLOAD, label: 'Unload', icon: '📥' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* ==================== HEADER ==================== */}
        <div className="relative px-6 py-5 border-b border-gray-200 dark:border-neutral-700 bg-gradient-to-r from-blue-500 to-indigo-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 text-white">
            <div className="p-3 bg-white/20 rounded-xl">
              <Package size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {initialData ? 'Edit Movement' : 'Create New Movement'}
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Complete 4-step process • Lines + Tasks
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  currentStep >= step 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'bg-white/20 text-white/60'
                }`}>
                  {currentStep > step ? <CheckCircle size={20} /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    currentStep > step ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 max-w-2xl mx-auto text-white/80 text-xs">
            <span>Info</span>
            <span>Items</span>
            <span>Tasks</span>
            <span>Review</span>
          </div>
        </div>

        {/* ==================== BODY ==================== */}
        {dataLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* ========== STEP 1: Basic Info ========== */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      🎯 Step 1: Basic Information
                    </h3>
                  </div>

                  {/* Movement Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Movement Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {movementTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-neutral-700 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                      value={formData.warehouseId}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          warehouseId: e.target.value,
                          sourceLocationId: '',
                          destinationLocationId: ''
                        });
                      }}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.code} - {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* FROM Location */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        From Location {formData.type === MovementType.TRANSFER && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white disabled:opacity-50"
                        value={formData.sourceLocationId}
                        onChange={(e) => {
                          const newLocationId = e.target.value;
                          setFormData({ ...formData, sourceLocationId: newLocationId });
                          
                          // Update all lines fromLocationId
                          const updatedLines = lines.map(line => ({
                            ...line,
                            fromLocationId: newLocationId
                          }));
                          setLines(updatedLines);
                        }}
                        disabled={!formData.warehouseId}
                      >
                        <option value="">Select FROM location</option>
                        {filteredLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {getLocationDisplayName(location)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* TO Location */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        To Location {formData.type === MovementType.TRANSFER && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white disabled:opacity-50"
                        value={formData.destinationLocationId}
                        onChange={(e) => {
                          const newLocationId = e.target.value;
                          setFormData({ ...formData, destinationLocationId: newLocationId });
                          
                          // ✅ Update all lines toLocationId
                          const updatedLines = lines.map(line => ({
                            ...line,
                            toLocationId: newLocationId
                          }));
                          setLines(updatedLines);
                          
                          // ✅ Update all tasks locationId automatically
                          const updatedTasks = tasks.map(task => ({
                            ...task,
                            locationId: newLocationId
                          }));
                          setTasks(updatedTasks);
                          
                          console.log('📍 Updated destination for lines & tasks:', newLocationId);
                        }}
                        disabled={!formData.warehouseId}
                      >
                        <option value="">Select TO location</option>
                        {filteredLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {getLocationDisplayName(location)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {priorities.map((priority) => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: priority.value })}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                            formData.priority === priority.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                        placeholder="e.g., TRF-2025-001"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Expected Date
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                        value={formData.expectedDate}
                        onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white resize-none"
                        rows={2}
                        placeholder="Any additional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========== STEP 2: Items ========== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      📦 Step 2: Add Items
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={addLine}
                    disabled={items.length === 0}
                    className="w-full px-6 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    <Plus size={20} />
                    Add Item Line
                  </button>

                  {lines.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="font-medium">No items added yet</p>
                      <p className="text-sm mt-2">Click "Add Item Line" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lines.map((line, index) => (
                        <div key={index} className="p-4 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-semibold text-gray-900 dark:text-white">Line {index + 1}</span>
                            <button 
                              onClick={() => removeLine(index)} 
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Item <span className="text-red-500">*</span>
                              </label>
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                value={line.itemId}
                                onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                              >
                                <option value="">Select Item</option>
                                {items.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.code} - {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                value={line.requestedQuantity}
                                onChange={(e) => updateLine(index, 'requestedQuantity', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Unit
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                placeholder="EA, KG, PCS"
                                value={line.uom}
                                onChange={(e) => updateLine(index, 'uom', e.target.value)}
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Notes
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                placeholder="Optional notes for this line..."
                                value={line.notes}
                                onChange={(e) => updateLine(index, 'notes', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========== STEP 3: Tasks ========== */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      📋 Step 3: Add Tasks (Optional)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assign tasks • You can skip this step
                    </p>
                    
                    {/* ✅ Info about auto-filled location */}
                    {formData.destinationLocationId && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
                        📍 Tasks will be automatically assigned to: <strong>
                          {locations.find(loc => loc.id === formData.destinationLocationId)
                            ? getLocationDisplayName(locations.find(loc => loc.id === formData.destinationLocationId))
                            : 'Selected destination'}
                        </strong>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={addTask}
                    className="w-full px-6 py-3 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus size={20} />
                    Add Task
                  </button>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="font-medium">No tasks added</p>
                      <p className="text-sm mt-2">Tasks are optional - you can skip this step</p>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      >
                        Skip to Review →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task, index) => (
                        <div key={index} className="p-4 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-semibold text-gray-900 dark:text-white">Task {index + 1}</span>
                            <button 
                              onClick={() => removeTask(index)} 
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Task Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                value={task.taskType}
                                onChange={(e) => updateTask(index, 'taskType', e.target.value)}
                              >
                                {taskTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Priority (1-10)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                value={task.priority}
                                onChange={(e) => updateTask(index, 'priority', parseInt(e.target.value) || 5)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Location
                                {task.locationId === formData.destinationLocationId && (
                                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                    ✓ Auto-filled
                                  </span>
                                )}
                              </label>
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                value={task.locationId}
                                onChange={(e) => updateTask(index, 'locationId', e.target.value)}
                              >
                                <option value="">Select Location</option>
                                {filteredLocations.map((location) => (
                                  <option key={location.id} value={location.id}>
                                    {getLocationDisplayName(location)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Scheduled Start
                              </label>
                              <input
                                type="datetime-local"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                                value={task.scheduledStartTime}
                                onChange={(e) => updateTask(index, 'scheduledStartTime', e.target.value)}
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Instructions
                              </label>
                              <textarea
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white resize-none"
                                rows={2}
                                placeholder="Task instructions..."
                                value={task.instructions}
                                onChange={(e) => updateTask(index, 'instructions', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========== STEP 4: Review ========== */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      ✅ Step 4: Review & Create
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review your movement details before creating
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Package size={20} />
                      Movement Summary
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Warehouse:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {warehouses.find(w => w.id === formData.warehouseId)?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formData.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Item Lines:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{lines.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tasks:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{tasks.length}</span>
                      </div>
                      {formData.referenceNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.referenceNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tasks Info */}
                  {tasks.length > 0 && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                            {tasks.length} task{tasks.length > 1 ? 's' : ''} will be created
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Tasks will be assigned to the destination location automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning if no tasks */}
                  {tasks.length === 0 && (
                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                            No tasks assigned
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Movement will be created without tasks. You can add tasks later.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ==================== FOOTER ==================== */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of 4
              </div>

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg border-2 border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all flex items-center gap-2"
                  >
                    {currentStep === 3 ? 'Review' : 'Next'}
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Create Movement
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};