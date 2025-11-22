// frontend/src/components/movements/MovementFormModal.tsx
// ✅ COMPLETE VERSION WITH ALL FIXES - TOAST.INFO ERROR FIXED

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, ArrowRight, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { movementService } from '@/services/movement.service';
import { inventoryService } from '@/services/inventory.service';
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
    actualQuantity: number; // ✅ ADDED
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

  // ✅ NEW: Helper function to get item display name
  const getItemDisplayName = (item: any): string => {
    if (!item) return 'Unknown';
    return `${item.sku || item.code || item.id.slice(0, 8)} - ${item.name || 'Unnamed Item'}`;
  };

  // ✅ NEW: Helper function to get location display name
  const getLocationDisplayName = (location: any): string => {
    if (!location) return 'Unknown';
    const parts = [];
    if (location.code) parts.push(location.code);
    if (location.zone) parts.push(`Zone: ${location.zone}`);
    if (location.aisle) parts.push(`Aisle: ${location.aisle}`);
    return parts.length > 0 ? parts.join(' | ') : location.id?.slice(0, 8) || 'Unknown';
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // ✅ FIXED: Auto-clear locations when warehouse changes - REMOVED toast.info()
  useEffect(() => {
    if (formData.warehouseId) {
      setFormData(prev => ({
        ...prev,
        sourceLocationId: '',
        destinationLocationId: ''
      }));
      // ✅ FIXED: Use toast() instead of toast.info()
      toast('🔄 Locations cleared - please select new locations for this warehouse', {
        icon: 'ℹ️',
        duration: 3000,
      });
    }
  }, [formData.warehouseId]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchWarehouses(),
        fetchLocations(),
        fetchItems()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await locationService.getWarehouses();
      const data = Array.isArray(response) ? response : response?.content || [];
      setWarehouses(data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Failed to load warehouses');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      const data = Array.isArray(response) ? response : response?.content || [];
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      const data = Array.isArray(response) ? response : response?.content || [];
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
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

  // ✅ MODIFIED: Auto-fill actualQuantity with requestedQuantity
  const addLine = () => {
    if (items.length === 0) {
      toast.error('❌ No items available');
      return;
    }
    
    const newLine = {
      itemId: items[0].id,
      requestedQuantity: 1,
      actualQuantity: 1, // ✅ ADDED: Auto-default to requestedQuantity
      uom: 'EA',
      fromLocationId: formData.sourceLocationId || '',
      toLocationId: formData.destinationLocationId || '',
      notes: '',
    };
    setLines([...lines, newLine]);
    console.log('➕ Line added with actualQuantity:', newLine);
    toast.success(`✅ Line added - Actual quantity set to ${newLine.requestedQuantity}`);
  };

  // ✅ MODIFIED: Auto-sync actualQuantity when requestedQuantity changes
  const updateLine = (index: number, field: string, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    
    // ✅ ADDED: Auto-sync actualQuantity when requestedQuantity changes
    if (field === 'requestedQuantity') {
      updatedLines[index].actualQuantity = value;
      console.log(`🔄 Auto-synced actualQuantity to ${value} for line ${index + 1}`);
    }
    
    setLines(updatedLines);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
    console.log(`🗑️ Line ${index + 1} removed`);
  };

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
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    console.log(`🗑️ Task ${index + 1} removed`);
  };

  const buildSubmitData = (): MovementRequestDto => {
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
      expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
      lines: lines.map((line, index) => ({
        itemId: line.itemId,
        requestedQuantity: line.requestedQuantity,
        actualQuantity: line.actualQuantity, // ✅ INCLUDED
        uom: line.uom,
        fromLocationId: line.fromLocationId || undefined,
        toLocationId: line.toLocationId || undefined,
        status: LineStatus.PENDING,
        lineNumber: index + 1,
        notes: line.notes || undefined,
      })),
      tasks: tasks.map(task => ({
        taskType: task.taskType,
        priority: task.priority,
        locationId: task.locationId || undefined,
        instructions: task.instructions || undefined,
        scheduledStartTime: task.scheduledStartTime ? new Date(task.scheduledStartTime).toISOString() : undefined,
      })),
    };

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
    return true;
  };

  const validateStep2 = (): boolean => {
    if (lines.length === 0) {
      toast.error('❌ Please add at least one line');
      return false;
    }
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].itemId) {
        toast.error(`❌ Line ${i + 1}: Please select an item`);
        return false;
      }
      if (lines[i].requestedQuantity <= 0) {
        toast.error(`❌ Line ${i + 1}: Quantity must be greater than 0`);
        return false;
      }
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    for (let i = 0; i < tasks.length; i++) {
      if (!tasks[i].taskType) {
        toast.error(`❌ Task ${i + 1}: Please select a task type`);
        return false;
      }
    }
    return true;
  };

  // ✅ NEW: Stock availability validation
  const validateInventoryAvailability = async () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.fromLocationId) continue; // Skip if no source location
      
      try {
        const available = await inventoryService.checkStockAvailability(
          line.itemId,
          line.fromLocationId,
          line.requestedQuantity
        );
        
        if (!available) {
          const item = items.find(it => it.id === line.itemId);
          const itemName = getItemDisplayName(item);
          toast.error(`❌ Insufficient stock for ${itemName}`);
          return false;
        }
      } catch (error) {
        console.warn('Could not check stock availability:', error);
        // Continue anyway - backend will validate
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

  // ✅ MODIFIED: Added stock validation before submit
  const handleSubmit = async () => {
    console.log('🚀 === STARTING SUBMISSION ===');
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      console.log('❌ Validation failed');
      return;
    }
  
    // ✅ ADDED: Stock availability check
    const hasStock = await validateInventoryAvailability();
    if (!hasStock) {
      toast.error('❌ Cannot create movement - insufficient stock');
      return;
    }
  
    const submitData = buildSubmitData();
    
    console.log('📦 === FINAL SUBMIT DATA ===');
    console.log(JSON.stringify(submitData, null, 2));
  
    setLoading(true);
    try {
      if (initialData) {
        await movementService.updateMovement(initialData.id, submitData);
        toast.success('✅ Movement updated successfully!');
      } else {
        const response = await movementService.createMovement(submitData);
        console.log('✅ Movement created:', response);
        toast.success('✅ Movement created! Inventory will update when completed.');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('❌ === FULL ERROR OBJECT ===');
      console.error(error);
      
      console.error('❌ === ERROR RESPONSE ===');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Headers:', error.response?.headers);
      console.error('Data:', error.response?.data);
      
      console.error('❌ === ERROR CONFIG ===');
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method);
      console.error('Request Data:', error.config?.data);
      
      // Extract the most detailed error message
      let errorMsg = 'Failed to save movement';
      
      if (error.response?.data) {
        // Try different common error response formats
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.errors) {
          // Handle validation errors array
          errorMsg = Array.isArray(error.response.data.errors)
            ? error.response.data.errors.join(', ')
            : JSON.stringify(error.response.data.errors);
        } else {
          // Show the whole response object as a string
          errorMsg = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      console.error('❌ === FINAL ERROR MESSAGE ===');
      console.error(errorMsg);
      
      toast.error(`❌ ${errorMsg}`, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };
  
  
  

  if (!isOpen) return null;

  const filteredLocations = locations.filter(
    loc => !formData.warehouseId || loc.warehouseId === formData.warehouseId
  );

  const movementTypes = [
    { value: MovementType.INBOUND, label: 'Inbound', icon: '📥' },
    { value: MovementType.OUTBOUND, label: 'Outbound', icon: '📤' },
    { value: MovementType.TRANSFER, label: 'Transfer', icon: '🔄' },
    { value: MovementType.ADJUSTMENT, label: 'Adjustment', icon: '⚖️' },
    { value: MovementType.RETURN, label: 'Return', icon: '↩️' },
    { value: MovementType.RECEIPT, label: 'Receipt', icon: '📦' },
    { value: MovementType.SHIPMENT, label: 'Shipment', icon: '🚚' },
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
        
        {/* HEADER */}
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

        {/* BODY */}
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
              
              {/* STEP 1: Basic Info */}
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
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
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
                      value={formData.warehouseId}
                      onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select warehouse...</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as MovementPriority })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Source & Destination Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Source Location
                      </label>
                      <select
                        value={formData.sourceLocationId}
                        onChange={(e) => setFormData({ ...formData, sourceLocationId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.warehouseId}
                      >
                        <option value="">Select source...</option>
                        {filteredLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {getLocationDisplayName(loc)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Destination Location
                      </label>
                      <select
                        value={formData.destinationLocationId}
                        onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.warehouseId}
                      >
                        <option value="">Select destination...</option>
                        {filteredLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {getLocationDisplayName(loc)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reference & Expected Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        placeholder="MOV-001"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Expected Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expectedDate}
                        onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Any additional notes..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Lines */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        📦 Step 2: Movement Lines
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add items to this movement
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addLine}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line
                    </button>
                  </div>

                  {lines.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No lines added yet</p>
                      <button
                        onClick={addLine}
                        className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                      >
                        Click "Add Line" to get started
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lines.map((line, index) => {
                        const item = items.find(it => it.id === line.itemId);
                        const itemName = getItemDisplayName(item);
                        const fromLoc = locations.find(loc => loc.id === line.fromLocationId);
                        const toLoc = locations.find(loc => loc.id === line.toLocationId);
                        const fromLocName = getLocationDisplayName(fromLoc);
                        const toLocName = getLocationDisplayName(toLoc);
                        
                        return (
                          <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{itemName}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Item ID: {line.itemId.slice(0, 8)}...</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLine(index)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Item Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Item <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={line.itemId}
                                  onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                  {items.map(item => (
                                    <option key={item.id} value={item.id}>
                                      {getItemDisplayName(item)}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Requested Quantity (auto-syncs with actualQuantity) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={line.requestedQuantity}
                                  onChange={(e) => updateLine(index, 'requestedQuantity', Number(e.target.value))}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  ✅ Actual qty will be set to {line.requestedQuantity} {line.uom}
                                </p>
                              </div>

                              {/* From Location with Display Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  From Location
                                </label>
                                <select
                                  value={line.fromLocationId}
                                  onChange={(e) => updateLine(index, 'fromLocationId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select source location...</option>
                                  {filteredLocations.map(loc => (
                                    <option key={loc.id} value={loc.id}>
                                      {getLocationDisplayName(loc)}
                                    </option>
                                  ))}
                                </select>
                                {line.fromLocationId && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Selected: {fromLocName}
                                  </p>
                                )}
                              </div>

                              {/* To Location with Display Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  To Location
                                </label>
                                <select
                                  value={line.toLocationId}
                                  onChange={(e) => updateLine(index, 'toLocationId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select destination location...</option>
                                  {filteredLocations.map(loc => (
                                    <option key={loc.id} value={loc.id}>
                                      {getLocationDisplayName(loc)}
                                    </option>
                                  ))}
                                </select>
                                {line.toLocationId && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Selected: {toLocName}
                                  </p>
                                )}
                              </div>

                              {/* UOM */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Unit of Measure
                                </label>
                                <input
                                  type="text"
                                  value={line.uom}
                                  onChange={(e) => updateLine(index, 'uom', e.target.value)}
                                  placeholder="EA, KG, L, etc."
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              {/* Notes */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Line Notes
                                </label>
                                <textarea
                                  value={line.notes}
                                  onChange={(e) => updateLine(index, 'notes', e.target.value)}
                                  rows={2}
                                  placeholder="Any notes for this line..."
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Tasks */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        📋 Step 3: Tasks (Optional)
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add tasks for this movement
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addTask}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No tasks added</p>
                      <button
                        onClick={addTask}
                        className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                      >
                        Add a task (optional)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">Task {index + 1}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTask(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Task Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={task.taskType}
                                onChange={(e) => updateTask(index, 'taskType', e.target.value as TaskType)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              >
                                {taskTypes.map(tt => (
                                  <option key={tt.value} value={tt.value}>
                                    {tt.icon} {tt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priority (1-10)
                              </label>
                              <input
                                type="number"
                                value={task.priority}
                                onChange={(e) => updateTask(index, 'priority', Number(e.target.value))}
                                min="1"
                                max="10"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                              </label>
                              <select
                                value={task.locationId}
                                onChange={(e) => updateTask(index, 'locationId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select location...</option>
                                {filteredLocations.map(loc => (
                                  <option key={loc.id} value={loc.id}>
                                    {getLocationDisplayName(loc)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Scheduled Start
                              </label>
                              <input
                                type="datetime-local"
                                value={task.scheduledStartTime}
                                onChange={(e) => updateTask(index, 'scheduledStartTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Instructions
                              </label>
                              <textarea
                                value={task.instructions}
                                onChange={(e) => updateTask(index, 'instructions', e.target.value)}
                                rows={2}
                                placeholder="Task instructions..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      ✅ Step 4: Review & Submit
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Review your movement details before submitting
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Info</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600 dark:text-gray-400">Type:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.type}</span></p>
                        <p><span className="text-gray-600 dark:text-gray-400">Priority:</span> <span className="font-medium text-gray-900 dark:text-white">{formData.priority}</span></p>
                        <p><span className="text-gray-600 dark:text-gray-400">Warehouse:</span> <span className="font-medium text-gray-900 dark:text-white">{warehouses.find(w => w.id === formData.warehouseId)?.name || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600 dark:text-gray-400">Lines:</span> <span className="font-medium text-gray-900 dark:text-white">{lines.length}</span></p>
                        <p><span className="text-gray-600 dark:text-gray-400">Tasks:</span> <span className="font-medium text-gray-900 dark:text-white">{tasks.length}</span></p>
                        <p><span className="text-gray-600 dark:text-gray-400">Total Qty:</span> <span className="font-medium text-gray-900 dark:text-white">{lines.reduce((sum, l) => sum + l.requestedQuantity, 0)}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Lines Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Lines ({lines.length})</h4>
                    <div className="space-y-2">
                      {lines.map((line, index) => {
                        const item = items.find(it => it.id === line.itemId);
                        const itemName = getItemDisplayName(item);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{itemName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Qty: {line.requestedQuantity} {line.uom} (actual: {line.actualQuantity} {line.uom})
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  {tasks.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tasks ({tasks.length})</h4>
                      <div className="space-y-2">
                        {tasks.map((task, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{task.taskType}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Priority: {task.priority}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Movement
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