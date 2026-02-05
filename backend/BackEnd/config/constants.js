/**
 * Application-wide constants and enums
 * Following DRY principle - centralized constant management
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  FURNITURE: 'furniture',
  OFFICE_SUPPLIES: 'office_supplies',
  EQUIPMENT: 'equipment',
  CONSUMABLES: 'consumables',
  OTHER: 'other',
};

// Product Status
export const PRODUCT_STATUS = {
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
  LOW_STOCK: 'low_stock',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  STOCK_IN: 'stock_in',
  STOCK_OUT: 'stock_out',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  DAMAGED: 'damaged',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Stock Alert Levels
export const STOCK_ALERT = {
  LOW_THRESHOLD: 10,
  CRITICAL_THRESHOLD: 5,
};

// Supplier Status
export const SUPPLIER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLACKLISTED: 'blacklisted',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  STOCK_IN: 'stock_in',
  STOCK_OUT: 'stock_out',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  SUPPLIER_ADDED: 'supplier_added',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Date Formats
export const DATE_FORMATS = {
  STANDARD: 'YYYY-MM-DD',
  WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
};

export default {
  USER_ROLES,
  USER_STATUS,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  STOCK_ALERT,
  SUPPLIER_STATUS,
  NOTIFICATION_TYPES,
  HTTP_STATUS,
  PAGINATION,
  DATE_FORMATS,
};
