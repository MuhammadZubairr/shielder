'use client';

import React from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  CreditCard,
  XCircle,
  AlertTriangle,
  UserPlus,
  RotateCcw,
  Bell,
  FileCheck,
  FileX,
  FileText,
  Trash2,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AdminNotification } from './types';
import { NOTIFICATION_TYPE_CONFIG, DEFAULT_TYPE_CONFIG } from './types';

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  CheckCircle2,
  CreditCard,
  XCircle,
  AlertTriangle,
  UserPlus,
  RotateCcw,
  Bell,
  FileCheck,
  FileX,
  FileText,
};

interface Props {
  notification: AdminNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  markingId: string | null;
  deletingId: string | null;
}

function formatTimeAgo(dateStr: string, locale: string): string {
  const now = Date.now();
  const diff = Math.floor((now - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return locale === 'ar' ? 'الآن' : 'just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return locale === 'ar' ? `منذ ${m} دقيقة` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return locale === 'ar' ? `منذ ${h} ساعة` : `${h}h ago`;
  }
  const d = Math.floor(diff / 86400);
  return locale === 'ar' ? `منذ ${d} يوم` : `${d}d ago`;
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  markingId,
  deletingId,
}: Props) {
  const { t, isRTL, locale } = useLanguage();
  const config = NOTIFICATION_TYPE_CONFIG[notification.type] ?? DEFAULT_TYPE_CONFIG;
  const IconComponent = ICON_MAP[config.icon] ?? Bell;
  const isUnread = !notification.isRead;

  return (
    <div
      className={[
        'relative flex gap-4 rounded-2xl border px-5 py-4 transition-all',
        isRTL ? 'flex-row-reverse' : '',
        isUnread
          ? 'bg-[#5B5FC7]/[0.03] border-[#5B5FC7]/20'
          : 'bg-white border-gray-100',
      ].join(' ')}
    >
      {/* Unread dot */}
      {isUnread && (
        <span
          className={[
            'absolute top-4 w-2 h-2 rounded-full bg-[#5B5FC7] flex-shrink-0',
            isRTL ? 'left-4' : 'right-4',
          ].join(' ')}
        />
      )}

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
      >
        <IconComponent size={18} className={config.color} />
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className={`text-sm font-semibold text-gray-900 leading-snug ${isUnread ? 'font-bold' : ''}`}>
            {notification.title}
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {formatTimeAgo(notification.createdAt, locale)}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        <div className={`flex items-center gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Type badge */}
          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
            {t(config.labelKey)}
          </span>

          {/* Source */}
          {notification.triggeredBy && (
            <span className="text-xs text-gray-400">
              {notification.triggeredBy}
            </span>
          )}

          {/* Action buttons */}
          <div className={`flex items-center gap-1 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
            {isUnread && (
              <button
                onClick={() => onMarkRead(notification.id)}
                disabled={markingId === notification.id}
                title={t('notifMarkRead')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#5B5FC7] hover:bg-[#5B5FC7]/10 transition-colors disabled:opacity-40"
              >
                <Eye size={14} />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              disabled={deletingId === notification.id}
              title={t('notifDelete')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
