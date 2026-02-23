'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatNum } from './KPICards';

export interface OrderTrendPoint {
  label: string;
  orders: number;
}

interface Props {
  data: OrderTrendPoint[];
  loading: boolean;
}

const Skeleton = () => (
  <div className="flex-1 rounded-xl bg-gray-100 animate-pulse" style={{ minHeight: 200 }} />
);

export default function OrderTrend({ data, loading }: Props) {
  const { t, locale } = useLanguage();

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
      aria-label={t('orderTrend')}
    >
      <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-5">
        {t('orderTrend')}
      </h2>

      <div className="flex-1" style={{ minHeight: 200 }}>
        {loading ? (
          <Skeleton />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {t('noDataAvailable')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={38}
                tickFormatter={(v) => formatNum(Number(v), locale)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: 11,
                }}
                formatter={(v: any) => [formatNum(Number(v), locale), t('ordersLabel')]}
              />
              <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === data.length - 1 ? '#FF6B35' : '#4F6EF7'}
                    fillOpacity={i === data.length - 1 ? 1 : 0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
