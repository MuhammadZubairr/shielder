'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { RevenuePoint } from './types';

interface Props {
  data: RevenuePoint[];
  loading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  locale: string;
  t: (k: string) => string;
  isRTL: boolean;
}

function CustomTooltip({ active, payload, label, locale, t }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const formatSAR = (v: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(v);

  const revenue = payload.find((p) => p.dataKey === 'revenue')?.value ?? 0;
  const orders = payload.find((p) => p.dataKey === 'orders')?.value ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[150px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-emerald-600 font-bold">{formatSAR(revenue)}</p>
      <p className="text-[#5B5FC7]">
        {orders} {t('reportOrdersLabel')}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-full w-full flex flex-col gap-3 p-4">
      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="flex-1 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );
}

export default function RevenueChart({ data, loading }: Props) {
  const { t, isRTL, locale } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-80">
      <h3 className={`text-base font-bold text-gray-800 mb-4 ${isRTL ? 'text-right' : ''}`}>
        {t('reportRevenueOverTime')}
      </h3>

      {loading ? (
        <Skeleton />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-3 text-gray-400">
          <TrendingUp size={40} className="opacity-30" />
          <p className="text-sm">{t('reportNoRevenueData')}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            reverseStackOrder={isRTL}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5B5FC7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#5B5FC7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              reversed={isRTL}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={55}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(v)
              }
            />
            <Tooltip
              content={
                <CustomTooltip locale={locale} t={t} isRTL={isRTL} />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#5B5FC7"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
