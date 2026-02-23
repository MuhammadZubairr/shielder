'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/store/auth.store';
import settingsService from '@/services/settings.service';
import SettingsTabs from './SettingsTabs';
import GeneralSettingsForm from './GeneralSettingsForm';
import CompanySettingsForm from './CompanySettingsForm';
import LocalizationSettingsForm from './LocalizationSettingsForm';
import InventorySettingsForm from './InventorySettingsForm';
import NotificationSettingsForm from './NotificationSettingsForm';
import SecuritySettingsForm from './SecuritySettingsForm';
import type { SettingsTab } from './types';

export default function AdminSettingsPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auth guard — ADMIN or SUPER_ADMIN only
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN'))) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsService.getSettings();
      setSettings((res as any)?.data?.data ?? (res as any)?.data ?? res);
      setFetchError(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? t('settingsFetchError');
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchSettings();
    }
  }, [authLoading, isAuthenticated, fetchSettings]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#5B5FC7]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <p className="text-red-600 font-medium">{fetchError}</p>
        <button
          onClick={fetchSettings}
          className="px-4 py-2 text-sm rounded-lg bg-[#5B5FC7] text-white hover:bg-[#4a4eb5] transition"
        >
          {t('settingsRetry')}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`max-w-5xl mx-auto px-4 sm:px-6 py-6 ${isRTL ? 'text-right' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settingsTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('settingsSubtitle')}</p>
      </div>

      {/* Mobile only horizontal tabs */}
      <div className="mb-4 lg:hidden">
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Desktop layout: sidebar + content */}
      <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Sidebar (desktop) */}
        <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Form panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="mb-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {t(`settingsTab${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}
              </h2>
            </div>

            {activeTab === 'general' && (
              <GeneralSettingsForm settings={settings} onSaved={fetchSettings} />
            )}
            {activeTab === 'company' && (
              <CompanySettingsForm settings={settings} onSaved={fetchSettings} />
            )}
            {activeTab === 'localization' && (
              <LocalizationSettingsForm onSaved={fetchSettings} />
            )}
            {activeTab === 'inventory' && (
              <InventorySettingsForm settings={settings} onSaved={fetchSettings} />
            )}
            {activeTab === 'notification' && (
              <NotificationSettingsForm settings={settings} onSaved={fetchSettings} />
            )}
            {activeTab === 'security' && (
              <SecuritySettingsForm settings={settings} onSaved={fetchSettings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
