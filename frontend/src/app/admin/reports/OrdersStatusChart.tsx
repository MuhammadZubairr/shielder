'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OrderStatusPoint } from './types';

interface Props {
  data: OrderStatusPoint[];
  loading: boolean;
}

function PieTooltip({
  active,
  payload,
  t,
  locale,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: OrderStatusPoint }>;
  t: (k: string) => string;
  locale: string;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700">{t(entry.payload.nameKey)}</p>
      <p className="text-gray-600">
        {new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(entry.value)}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string; payload: OrderStatusPoint }>;
  t: (k: string) => string;
  locale: string;
  isRTL: boolean;
  total: number;
}

function CustomLegend({ payload, t, locale, isRTL, total }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div
      className={`flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-xs text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}
    >
      {payload.map((entry) => {
        const pct = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
        return (
          <span key={entry.value} className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.color }} />
            <span>{t(entry.payload.nameKey)}</span>
            <span className="font-semibold text-gray-700">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(entry.payload.value)}
            </span>
            <span className="text-gray-400">({pct}%)</span>
          </span>
        );
      })}
    </div>
  );
}

export default function OrdersStatusChart({ data, loading }: Props) {
  const { t, isRTL, locale } = useLanguage();
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-80">
      <h3 className={`text-base font-bold text-gray-800 mb-2 ${isRTL ? 'text-right' : ''}`}>
        {t('reportOrderStatusBreakdown')}
      </h3>

      {loading ? (
        <Skeleton />
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-3 text-gray-400">
          <PieIcon size={40} className="opacity-30" />
          <p className="text-sm">{t('reportNoData')}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              startAngle={isRTL ? -90 : 90}
              endAngle={isRTL ? 270 : -270}
            >
              {data.map((entry) => (
                <Cell key={entry.nameKey} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<PieTooltip t={t} locale={locale} />}
            />
            <Legend
              content={(props) => (
                <CustomLegend
                  payload={props.payload as CustomLegendProps['payload']}
                  t={t}
                  locale={locale}
                  isRTL={isRTL}
                  total={total}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
