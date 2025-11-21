// Common Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

// Auth Types
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  sku: string;
  categoryId?: string;
  category?: Category;
  unitOfMeasure: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemVariant {
  id: string;
  itemId: string;
  item?: Item;
  variantName: string;
  sku: string;
  attributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface Lot {
  id: string;
  lotNumber: string;
  itemId: string;
  item?: Item;
  quantity: number;
  expiryDate?: string;
  manufactureDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Serial {
  id: string;
  serialNumber: string;
  itemId: string;
  item?: Item;
  lotId?: string;
  lot?: Lot;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  itemId: string;
  item?: Item;
  locationId: string;
  location?: Location;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lotId?: string;
  lot?: Lot;
  serialId?: string;
  serial?: Serial;
  status: string;
  lastUpdated: string;
}
// Movement Types - CORRECTED TO MATCH BACKEND

export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  RECEIPT = 'RECEIPT',
  SHIPMENT = 'SHIPMENT'
}

export enum MovementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED'
}

export enum MovementPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum LineStatus {
  PENDING = 'PENDING',
  ALLOCATED = 'ALLOCATED',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskType {
  PICK = 'PICK',
  PACK = 'PACK',
  SHIP = 'SHIP',
  RECEIVE = 'RECEIVE',
  COUNT = 'COUNT',
  PUTAWAY = 'PUTAWAY',
  TRANSFER = 'TRANSFER',
  INSPECT = 'INSPECT',
  LOAD = 'LOAD',
  UNLOAD = 'UNLOAD'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
export interface Movement {
  id: string;
  referenceNumber?: string;
  type: MovementType;
  status: MovementStatus;
  priority: MovementPriority;
  
  // IDs
  warehouseId: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  
  // Display Names (returned by backend or populated by frontend)
  warehouseName?: string;
  sourceLocationName?: string;
  destinationLocationName?: string;
  
  // Dates
  movementDate: string;
  expectedDate?: string;
  actualDate?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Additional Info
  notes?: string;
  reason?: string;
  
  // User Info
  createdBy: string;
  completedBy?: string;
  createdByName?: string;      // Display name
  completedByName?: string;     // Display name
  
  // Related Data
  lines: MovementLine[];
  tasks?: MovementTask[];
  
  // Calculated Fields
  totalLines?: number;
  completedLines?: number;
  pendingTasks?: number;
  totalQuantityRequested?: number;
  totalQuantityActual?: number;
}
export interface MovementLine {
  id: string;
  movementId: string;
  lineNumber: number;
  
  // Item IDs
  itemId: string;
  lotId?: string;
  serialId?: string;
  
  // Display Names
  itemName?: string;
  itemSKU?: string;
  itemDescription?: string;
  lotNumber?: string;
  serialNumber?: string;
  
  // Movement Reference
  movementReferenceNumber?: string;
  movementType?: MovementType;
  
  // Quantities
  requestedQuantity: number;
  actualQuantity?: number;
  varianceQuantity?: number;
  uom?: string;
  
  // Location IDs
  fromLocationId?: string;
  toLocationId?: string;
  
  // Location Names
  fromLocationName?: string;
  toLocationName?: string;
  
  // Status
  status: LineStatus;
  
  // Additional Info
  notes?: string;
  reason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Related Objects (optional)
  item?: Item;
  lot?: Lot;
  serial?: Serial;
}

// ============================================
// MOVEMENT TASK - WITH DISPLAY NAMES
// ============================================
export interface MovementTask {
  id: string;
  movementId: string;
  movementLineId?: string;
  
  // Task Info
  taskType: TaskType;
  status: TaskStatus;
  priority: number;
  
  // Movement Reference
  movementReferenceNumber?: string;
  movementType?: MovementType;
  
  // Assignment
  assignedUserId?: string;
  assignedToId?: string;        // Alternative field name
  assignedToName?: string;       // Display name
  assignedTo?: string;           // Alternative display name
  
  // Location
  locationId?: string;
  locationName?: string;         // Display name
  
  // Timeline
  scheduledStartTime?: string;
  actualStartTime?: string;
  expectedCompletionTime?: string;
  actualCompletionTime?: string;
  actualEndTime?: string;        // Alternative field name
  
  // Additional Info
  instructions?: string;
  description?: string;          // Alternative field name
  notes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Calculated Fields
  durationMinutes?: number;
  isOverdue?: boolean;
  
  // Related Objects (optional)
  movement?: {
    id: string;
    referenceNumber?: string;
    movementNumber?: string;
    type: MovementType;
  };
}

// ============================================
// REQUEST DTOs
// ============================================
export interface MovementRequestDto {
  type: MovementType;
  movementDate?: string;
  status?: MovementStatus;
  priority?: MovementPriority;
  expectedDate?: string;
  scheduledDate?: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  warehouseId: string;
  referenceNumber?: string;
  notes?: string;
  reason?: string;
  lines: MovementLineRequestDto[];
  tasks?: MovementTaskRequestDto[];
}

export interface MovementLineRequestDto {
  itemId: string;
  requestedQuantity: number;
  actualQuantity?: number;
  uom?: string;
  lotId?: string;
  serialId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  status?: LineStatus;
  lineNumber: number;
  notes?: string;
  reason?: string;
}

export interface MovementTaskRequestDto {
  movementLineId?: string;
  assignedUserId?: string;
  taskType: TaskType;
  status?: TaskStatus;
  priority?: number;
  scheduledStartTime?: string;
  expectedCompletionTime?: string;
  locationId?: string;
  instructions?: string;
  notes?: string;
}
// Location Types
export interface Site {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  siteId: string;
  site?: Site;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  warehouse?: Warehouse;
  locationType: string;
  parentId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Quality Types
export interface QualityControl {
  id: string;
  controlNumber: string;
  itemId: string;
  item?: Item;
  lotId?: string;
  lot?: Lot;
  serialId?: string;
  serial?: Serial;
  status: string;
  testResults?: Record<string, any>;
  passed: boolean;
  testedBy?: string;
  testedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quarantine {
  id: string;
  quarantineNumber: string;
  itemId: string;
  item?: Item;
  lotId?: string;
  lot?: Lot;
  serialId?: string;
  serial?: Serial;
  reason: string;
  status: string;
  quarantinedBy?: string;
  quarantinedDate: string;
  releasedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityAttachment {
  id: string;
  qualityControlId?: string;
  quarantineId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy?: string;
  uploadedDate: string;
}

// Alert Types
export interface Alert {
  id: string;
  alertNumber: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  itemId?: string;
  item?: Item;
  locationId?: string;
  location?: Location;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  resolvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readDate?: string;
  createdAt: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: string;
  severity: string;
  enabled: boolean;
  notificationChannels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}





