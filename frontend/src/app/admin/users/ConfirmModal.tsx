'use client';

import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const { t, isRTL } = useLanguage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          disabled={loading}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40`}
        >
          <X size={16} />
        </button>

        {/* Icon + title */}
        <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              danger ? 'bg-red-100' : 'bg-amber-100'
            }`}
          >
            <AlertTriangle
              size={20}
              className={danger ? 'text-red-600' : 'text-amber-600'}
            />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 leading-snug">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            {cancelLabel ?? t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#5B5FC7] hover:bg-[#4a4eb0]'
            }`}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel ?? t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
