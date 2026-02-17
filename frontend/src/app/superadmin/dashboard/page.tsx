'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Activity as ActivityIcon,
  BadgeAlert,
  Clock
} from 'lucide-react';
import adminService from '@/services/admin.service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import Link from 'next/link';

interface DashboardSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface LowStockProduct {
  id: string;
  translations: { name: string; locale: string }[];
  stock: number;
  minimumStockThreshold: number;
  brand?: { name: string };
  category?: { translations: { name: string; locale: string }[] };
}

interface MonthlyAnalytic {
  month: string;
  orders: number;
  revenue: number;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  type: 'success' | 'pending' | 'issue';
}

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [analytics, setAnalytics] = useState<MonthlyAnalytic[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, lowStockRes, analyticsRes, activityRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getLowStockProducts(),
        adminService.getMonthlyAnalytics(),
        adminService.getActivity()
      ]);

      setSummary(summaryRes.data.data);
      setLowStock(lowStockRes.data.products || []);
      setAnalytics(analyticsRes.data.data);
      setActivities(activityRes.data.data);
    } catch (err: any) {
      setError('Failed to refresh system dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-red-100 min-h-[400px]">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <BadgeAlert className="text-red-500" size={48} />
        </div>
        <h3 className="text-xl font-bold text-[#0A1E36]">Data Fetch Error</h3>
        <p className="text-gray-500 mt-2 text-center max-w-md">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#0205A6] text-white rounded-xl hover:bg-[#0A1E36] transition-colors font-semibold"
        >
          <RefreshCcw size={18} />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1E36] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time status of Shielder marketplace</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700 bg-white"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* 3. LOW STOCK ALERT CARD */}
      <section>
        {lowStock.length > 0 ? (
          <div className="bg-[#FFF1F2] border-l-[6px] border-[#DC2626] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#DC2626] p-2 rounded-lg text-white">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#0A1E36]">Low Stock Alerts</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {lowStock.slice(0, 6).map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-xl border border-red-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#0A1E36] line-clamp-1">{product.translations?.[0]?.name}</h4>
                      {product.stock <= 2 ? (
                        <span className="px-2 py-1 bg-[#FEE2E2] text-[#DC2626] text-[10px] font-black rounded uppercase">CRITICAL</span>
                      ) : (
                        <span className="px-2 py-1 bg-[#FEF9C3] text-[#A16207] text-[10px] font-black rounded uppercase">LOW</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Supplier: <span className="text-gray-700 font-medium">{product.brand?.name || 'N/A'}</span></p>
                    <p className="text-sm font-semibold">Stock: <span className={product.stock <= 2 ? 'text-[#DC2626]' : 'text-[#A16207]'}>{product.stock} units</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Link 
                href="/superadmin/products?filter=lowstock"
                className="flex items-center gap-2 text-sm font-bold text-[#DC2626] hover:underline"
              >
                Manage Inventory
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#F0FDF4] border-l-[6px] border-[#16A34A] rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="bg-[#16A34A] p-2 rounded-lg text-white">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0A1E36]">Healthy Inventory</h2>
              <p className="text-gray-600">All inventory levels are healthy and within thresholds.</p>
            </div>
          </div>
        )}
      </section>

      {/* 4. DASHBOARD STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Users" 
          value={summary?.totalUsers.toLocaleString() || '0'} 
          icon={Users}
          color="#0205A6"
        />
        <StatsCard 
          label="Total Products" 
          value={summary?.totalProducts.toLocaleString() || '0'} 
          icon={Package}
          color="#0205A6"
        />
        <StatsCard 
          label="Total Orders" 
          value={summary?.totalOrders.toLocaleString() || '0'} 
          icon={ShoppingCart}
          color="#0205A6"
        />
        <StatsCard 
          label="Total Revenue" 
          value={`${summary?.totalRevenue.toLocaleString() || '0'} SAR`} 
          icon={TrendingUp}
          color="#0205A6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 5. ANALYTICS SECTION */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg text-[#0205A6]">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-[#0A1E36] text-lg">Revenue Analytics</h3>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={((value: any) => [`${(Number(value) || 0).toLocaleString()} SAR`, 'Revenue']) as any}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0205A6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0205A6', strokeWidth: 2, stroke: '#FFF' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg text-[#045870]">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-[#0A1E36] text-lg">Orders Overview</h3>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="orders" fill="#045870" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* 6. RECENT ACTIVITY SECTION */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-gray-50 p-2 rounded-lg text-[#0A1E36]">
            <ActivityIcon size={20} />
          </div>
          <h3 className="font-bold text-[#0A1E36] text-lg">Monitoring Log</h3>
        </div>
        
        <div className="space-y-4">
          {activities.length > 0 ? activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'success' ? 'bg-[#16A34A]' : 
                  activity.type === 'pending' ? 'bg-[#FACC15]' : 
                  'bg-[#DC2626]'
                }`} />
                <div>
                  <p className="font-bold text-[#0A1E36]">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <Clock size={14} />
                {new Date(activity.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-400">
              <RefreshCcw className="mx-auto mb-2 opacity-20" size={32} />
              <p>No recent activity detected</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm border-t-[5px] hover:-translate-y-2 transition-all duration-300 group cursor-default" style={{ borderTopColor: color }}>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-blue-50 transition-colors">
          <Icon className="text-gray-400 group-hover:text-[#0205A6]" size={24} />
        </div>
      </div>
      <p className="text-gray-500 font-medium text-sm mb-1">{label}</p>
      <h3 className="text-2xl font-black text-[#0A1E36] tracking-tight">{value}</h3>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-12 w-1/3 bg-gray-200 rounded-lg"></div>
      <div className="h-40 w-full bg-gray-100 rounded-2xl"></div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[16px]"></div>)}
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="h-[450px] bg-gray-100 rounded-2xl"></div>
        <div className="h-[450px] bg-gray-100 rounded-2xl"></div>
      </div>
    </div>
  );
}
