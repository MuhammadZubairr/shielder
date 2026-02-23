'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStockStatus, type StockStatusType } from './types';

interface Props {
  stock: number;
  threshold: number;
}

const CONFIG: Record<
  StockStatusType,
  { labelKey: string; bgClass: string; textClass: string; Icon: React.ElementType }
> = {
  IN_STOCK: {
    labelKey: 'inStock',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    Icon: CheckCircle2,
  },
  LOW_STOCK: {
    labelKey: 'lowStock',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    Icon: AlertTriangle,
  },
  OUT_OF_STOCK: {
    labelKey: 'outOfStock',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    Icon: XCircle,
  },
};

export default function StockStatusBadge({ stock, threshold }: Props) {
  const { t } = useLanguage();
  const status = getStockStatus(stock, threshold);
  const { labelKey, bgClass, textClass, Icon } = CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${bgClass} ${textClass}`}
    >
      <Icon size={11} aria-hidden="true" />
      {t(labelKey)}
    </span>
  );
}
