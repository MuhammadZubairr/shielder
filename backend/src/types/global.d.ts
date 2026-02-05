/**
 * Global TypeScript Definitions
 * Type definitions and interfaces used across the application
 */

import { Request } from 'express';

/**
 * Extended Express Request with user information
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * User Roles
 */
export type UserRole = 'admin' | 'customer' | 'dealer' | 'sales';

/**
 * User Status
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/**
 * Order Status
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Product Status
 */
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

/**
 * Supported Locales
 */
export type Locale = 'en' | 'ar';
