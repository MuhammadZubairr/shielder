'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCcw, BadgeAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/store/auth.store';
import adminService from '@/services/admin.service';

import KPICards, { type KPIData } from './KPICards';
import LowStockPanel, { type LowStockProduct } from './LowStockPanel';
import SalesChart, { type MonthlyDataPoint } from './SalesChart';
import OrderTrend, { type OrderTrendPoint } from './OrderTrend';
import TopProducts, { type CategoryDataPoint } from './TopProducts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely unwrap `{ data: { data: ... } }` or `{ data: ... }` */
function unwrap<T>(res: any): T {
  return res?.data?.data ?? res?.data ?? res;
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();

  const [kpiData, setKpiData]         = useState<KPIData | null>(null);
  const [lowStock, setLowStock]       = useState<LowStockProduct[]>([]);
  const [chartData, setChartData]     = useState<MonthlyDataPoint[]>([]);
  const [orderTrend, setOrderTrend]   = useState<OrderTrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<CategoryDataPoint[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const role = (user as any)?.role;
    if (role === 'SUPER_ADMIN') {
      router.replace('/superadmin/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, lowStockRes, revenueRes, ordersRes, quotationsRes, categoryRes] =
        await Promise.allSettled([
          adminService.getOverview(),
          adminService.getLowStockProducts(),
          adminService.getMonthlyRevenue(),
          adminService.getMonthlyOrders(),
          adminService.getQuotationsTotalCount(),
          adminService.getByCategory(),
        ]);

      // ── KPI cards ──
      if (overviewRes.status === 'fulfilled') {
        const d = unwrap<any>(overviewRes.value);
        const totalQuotations =
          quotationsRes.status === 'fulfilled'
            ? (unwrap<any>(quotationsRes.value)?.pagination?.total ??
               (quotationsRes.value as any)?.data?.pagination?.total ??
               0)
            : 0;
        setKpiData({
          totalProducts:  d.totalProducts  ?? 0,
          totalStock:     d.totalStock     ?? 0,
          inventoryValue: d.inventoryValue ?? 0,
          totalRevenue:   d.totalRevenue   ?? 0,
          totalQuotations,
        });
      }

      // ── Low stock ──
      if (lowStockRes.status === 'fulfilled') {
        const d = unwrap<any>(lowStockRes.value);
        setLowStock(Array.isArray(d) ? d : d?.products ?? []);
      }

      // ── Chart: merge revenue + orders by month ──
      const revenueArr: any[] =
        revenueRes.status === 'fulfilled' ? unwrap<any[]>(revenueRes.value) ?? [] : [];
      const ordersArr: any[] =
        ordersRes.status === 'fulfilled' ? unwrap<any[]>(ordersRes.value) ?? [] : [];

      const merged: Record<string, MonthlyDataPoint> = {};
      revenueArr.forEach((r: any) => {
        const key = String(r.month);
        merged[key] = { month: key, revenue: Number(r.revenue ?? r.value ?? 0) };
      });
      ordersArr.forEach((o: any) => {
        const key = String(o.month);
        const count = Number(o.orderCount ?? o.orders ?? o.value ?? o.count ?? 0);
        if (merged[key]) {
          merged[key].orders = count;
        } else {
          merged[key] = { month: key, orders: count };
        }
      });
      setChartData(Object.values(merged).sort((a, b) => a.month.localeCompare(b.month)));

      // ── Order Trend (monthly orders as bar chart) ──
      const trendPoints: OrderTrendPoint[] = ordersArr.map((o: any) => ({
        label: String(o.month ?? '').slice(0, 7), // e.g. "2026-01"
        orders: Number(o.orderCount ?? o.orders ?? o.count ?? 0),
      }));
      setOrderTrend(trendPoints);

      // ── Top Products by category ──
      if (categoryRes.status === 'fulfilled') {
        const cats: any[] = unwrap<any[]>(categoryRes.value) ?? [];
        setTopProducts(
          cats
            .map((c: any) => ({
              name: c.categoryName ?? c.name ?? 'Unknown',
              value: c.productCount ?? c.count ?? c.value ?? 0,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
        );
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAll();
    }
  }, [authLoading, isAuthenticated, fetchAll]);

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-red-100 min-h-[400px]">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <BadgeAlert className="text-red-500" size={48} aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{t('error')}</h3>
        <p className="text-gray-500 mt-2 text-center max-w-md">{error}</p>
        <button
          onClick={fetchAll}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#5B5FC7] text-white rounded-xl hover:bg-[#4a4eb6] transition-colors font-semibold"
        >
          <RefreshCcw size={18} aria-hidden="true" />
          {t('retryBtn')}
        </button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <main
      className="space-y-6 pb-6 animate-in fade-in duration-300"
      aria-label={t('adminDashboard')}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">{t('overviewTitle')}</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{t('overviewSubtitle')}</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          aria-label={t('refreshBtn')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 bg-white text-sm disabled:opacity-50"
        >
          <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          {t('refreshBtn')}
        </button>
      </div>

      {/* ── Low Stock Alert Panel ── */}
      <LowStockPanel items={lowStock} loading={loading} />

      {/* ── KPI Summary Cards ── */}
      <KPICards data={kpiData} loading={loading} />

      {/* ── Monthly Sales Chart ── */}
      <SalesChart data={chartData} loading={loading} />

      {/* ── Bottom Row: Order Trend + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <OrderTrend data={orderTrend} loading={loading} />
        </div>
        <TopProducts data={topProducts} loading={loading} />
      </div>
    </main>
  );
}

