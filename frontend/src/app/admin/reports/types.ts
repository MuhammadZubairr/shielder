// ─── Admin Reports Module — Shared Types ─────────────────────────────────────

export interface ReportDateRange {
  from: string; // ISO string
  to: string;   // ISO string
}

export interface OrderSummaryData {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface RevenuePoint {
  date: string;   // formatted label
  revenue: number;
  orders: number;
}

export interface OrderStatusPoint {
  name: string;     // translated label
  nameKey: string;  // translation key
  value: number;
  color: string;
}

export interface TopProduct {
  id: string;
  name: string;
  nameAr?: string;
  sku?: string;
  price: number;
  stock: number;
  totalValue: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockCount: number;
  totalCustomers: number;
}

export type GroupBy = 'day' | 'week';
