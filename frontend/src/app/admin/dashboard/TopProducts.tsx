'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

const PIE_COLORS = ['#0C1B33', '#FF6B35', '#4F6EF7', '#22c55e', '#a855f7', '#f59e0b'];

export interface CategoryDataPoint {
  name: string;
  value: number; // product count
}

interface Props {
  data: CategoryDataPoint[];
  loading: boolean;
}

const Skeleton = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3">
    <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
    <div className="space-y-2 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

export default function TopProducts({ data, loading }: Props) {
  const { t } = useLanguage();

  // Calculate percentages from raw product counts
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const pieData = data.slice(0, 6).map((d, i) => ({
    ...d,
    pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  // The largest slice percentage for center label
  const topPct = pieData[0]?.pct ?? 0;

  return (
    <section
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
      aria-label={t('topProducts')}
    >
      <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-4">
        {t('topProducts')}
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center">
        {loading ? (
          <Skeleton />
        ) : pieData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm py-10">
            {t('noDataAvailable')}
          </div>
        ) : (
          <>
            {/* Donut chart */}
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800">{topPct}%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5 w-full">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: p.color }}
                    />
                    <span className="text-gray-500 font-medium truncate">{p.name}</span>
                  </div>
                  <span className="font-bold text-gray-700 flex-shrink-0 ms-2">{p.pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
