import apiClient from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';

class OrderService {
  async getOrders(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.BASE, { params });
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.BY_ID(id));
    return response.data;
  }

  async updateOrderStatus(id: string, statusData: { status?: string; paymentStatus?: string }) {
    const response = await apiClient.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), statusData);
    return response.data;
  }

  async getOrderSummary() {
    const response = await apiClient.get(`${API_ENDPOINTS.ORDERS.BASE}/summary`);
    return response.data;
  }

  async createOrder(orderData: any) {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.BASE, orderData);
    return response.data;
  }
}

export const orderService = new OrderService();
