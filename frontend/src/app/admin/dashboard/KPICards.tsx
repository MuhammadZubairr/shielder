'use client';

import React from 'react';
import { Package, Layers, TrendingUp, ShoppingCart, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KPIData {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  totalRevenue: number;
  totalQuotations: number;
}

interface Props {
  data: KPIData | null;
  loading: boolean;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/** Always formats as SAR regardless of selected language */
export const formatSAR = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const formatNum = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(value);

// ─── Single Card ─────────────────────────────────────────────────────────────

const KPICard = ({
  label,
  value,
  icon: Icon,
  bgColor,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  bgColor: string;
  loading: boolean;
}) => (
  <div
    className="rounded-2xl p-5 flex items-center gap-4 shadow-sm"
    style={{ backgroundColor: bgColor }}
    role="region"
    aria-label={label}
  >
    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={22} className="text-white" aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest leading-tight break-words">
        {label}
      </p>
      {loading ? (
        <div className="h-7 w-20 bg-white/20 rounded-lg mt-1 animate-pulse" aria-label="Loading" />
      ) : (
        <h3 className="text-white text-xl font-black leading-tight mt-0.5 break-words">{value}</h3>
      )}
    </div>
  </div>
);

// ─── KPI Cards Grid ───────────────────────────────────────────────────────────

export default function KPICards({ data, loading }: Props) {
  const { t, locale } = useLanguage();

  const cards = [
    {
      label: t('totalProducts'),
      value: formatNum(data?.totalProducts ?? 0, locale),
      icon: Package,
      bgColor: '#5B5FC7',
    },
    {
      label: t('totalStock'),
      value: formatNum(data?.totalStock ?? 0, locale),
      icon: Layers,
      bgColor: '#374151',
    },
    {
      label: t('inventoryValue'),
      value: formatSAR(data?.inventoryValue ?? 0, locale),
      icon: TrendingUp,
      bgColor: '#FF6B35',
    },
    {
      label: t('totalRevenue'),
      value: formatSAR(data?.totalRevenue ?? 0, locale),
      icon: ShoppingCart,
      bgColor: '#5B5FC7',
    },
    {
      label: t('totalQuotations'),
      value: formatNum(data?.totalQuotations ?? 0, locale),
      icon: FileText,
      bgColor: '#374151',
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      role="list"
      aria-label={t('adminDashboard')}
    >
      {cards.map((card) => (
        <KPICard key={card.label} {...card} loading={loading} />
      ))}
    </div>
  );
}
