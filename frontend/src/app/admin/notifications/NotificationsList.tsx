'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationItem from './NotificationItem';
import type { AdminNotification } from './types';

interface Props {
  notifications: AdminNotification[];
  loading: boolean;
  markingId: string | null;
  deletingId: string | null;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function SkeletonItem() {
  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-48 bg-gray-100 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
        <div className="h-5 w-20 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function NotificationsList({
  notifications,
  loading,
  markingId,
  deletingId,
  onMarkRead,
  onDelete,
}: Props) {
  const { t, isRTL } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)}
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 gap-3 text-gray-400 ${isRTL ? 'text-right' : ''}`}>
        <Bell size={48} className="opacity-20" />
        <p className="text-base font-semibold text-gray-500">{t('notifEmpty')}</p>
        <p className="text-sm">{t('notifEmptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
          markingId={markingId}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}
