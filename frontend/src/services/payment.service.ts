import apiClient from './api.service';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface PaymentStats {
  totalRevenue: number;
  todayRevenue: number;
  pendingPayments: number;
  failedPayments: number;
}

export interface Payment {
  id: string;
  orderId: string;
  recordedBy: string | null;
  amount: string | number;
  method: string;
  status: string;
  transactionId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    orderNumber: string;
    customerName: string;
    total: string | number;
  };
  recorder?: {
    profile?: {
      fullName: string;
    }
  };
}

export const paymentService = {
  /**
   * Get payment dashboard statistics
   */
  async getStats(): Promise<ApiResponse<PaymentStats>> {
    const response = await apiClient.get('/payments/stats');
    return response.data;
  },

  /**
   * List all payments with filtering and pagination
   */
  async getPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get('/payments', { params });
    return response.data;
  },

  /**
   * Get single payment details
   */
  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  },

  /**
   * Record a new manual payment
   */
  async recordPayment(data: {
    orderId: string;
    amount: number;
    method: string;
    transactionId?: string;
    notes?: string;
  }): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  /**
   * Process a refund for a payment
   */
  async refundPayment(id: string, notes?: string): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post(`/payments/${id}/refund`, { notes });
    return response.data;
  },
};
