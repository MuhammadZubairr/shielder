'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationForm from './NotificationForm';

export default function CreateNotificationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user?.role !== 'ADMIN') { router.replace('/login'); }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw size={28} className="animate-spin text-[#5B5FC7]" />
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Breadcrumb */}
      <div className={`flex items-center gap-2 text-sm text-gray-400 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
        <Link href="/admin/notifications" className="hover:text-[#5B5FC7] transition-colors font-medium">
          {t('notifTitle')}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{t('notifCreate')}</span>
      </div>

      {/* Header */}
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Link
          href="/admin/notifications"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <BackIcon size={16} />
        </Link>
        <div className={isRTL ? 'text-right' : ''}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Bell size={20} className="text-[#5B5FC7]" />
            <h1 className="text-xl font-black text-gray-900">{t('notifCreateTitle')}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{t('notifCreateSubtitle')}</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <NotificationForm />
      </div>
    </div>
  );
}
