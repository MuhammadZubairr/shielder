'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TopProduct } from './types';

interface Props {
  products: TopProduct[];
  loading: boolean;
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className="border-b border-gray-50" key={index}>
      {[1, 2, 3, 4, 5].map((c) => (
        <td key={c} className="px-4 py-3">
          <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: c === 2 ? '70%' : '50%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function TopProductsTable({ products, loading }: Props) {
  const { t, isRTL, locale } = useLanguage();

  const fmtSAR = (v: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(v);

  const fmtNum = (v: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(v);

  const columns = [
    { key: 'rank', label: t('reportRank'), align: isRTL ? 'text-right' : 'text-left' },
    { key: 'name', label: t('reportProductName'), align: isRTL ? 'text-right' : 'text-left' },
    { key: 'sku', label: t('reportSku'), align: isRTL ? 'text-right' : 'text-left' },
    { key: 'price', label: t('reportPrice'), align: 'text-right' },
    { key: 'stock', label: t('reportStock'), align: 'text-right' },
    { key: 'value', label: t('reportTotalValue'), align: 'text-right' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h3 className="text-base font-bold text-gray-800">{t('reportTopProducts')}</h3>
        <span className="text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1">
          {products.length} {t('reportProductName')}
        </span>
      </div>

      {loading ? (
        <table className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${c.align}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow index={i} key={i} />)}
          </tbody>
        </table>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Package size={40} className="opacity-30" />
          <p className="text-sm">{t('reportNoProductsData')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${c.align}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p, i) => {
                const displayName = isRTL && p.nameAr ? p.nameAr : p.name;
                const stockLow = p.stock <= 10;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#5B5FC7]/10 text-[#5B5FC7] text-xs font-bold">
                        {i + 1}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{displayName}</p>
                    </td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-gray-500 font-mono">{p.sku ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-700">{fmtSAR(p.price)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${stockLow ? 'text-red-600' : 'text-gray-700'}`}>
                        {fmtNum(p.stock)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-gray-800">{fmtSAR(p.totalValue)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
