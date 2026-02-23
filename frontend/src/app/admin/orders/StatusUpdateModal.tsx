'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { orderService } from '@/services/order.service';
import OrderStatusBadge from './OrderStatusBadge';
import type { OrderStatus } from './types';

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StatusUpdateModal({
  orderId,
  currentStatus,
  newStatus,
  onClose,
  onSuccess,
}: Props) {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(t('orderUpdateSuccess'));
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('orderUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">{t('confirmStatusTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          {t('confirmStatusMsg')}
        </p>

        {/* Status transition */}
        <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
          <OrderStatusBadge status={currentStatus} />
          <span className="text-gray-400 font-bold">→</span>
          <OrderStatusBadge status={newStatus} />
        </div>

        {/* Actions */}
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {t('confirmStatusAction')}
          </button>
        </div>
      </div>
    </div>
  );
}
