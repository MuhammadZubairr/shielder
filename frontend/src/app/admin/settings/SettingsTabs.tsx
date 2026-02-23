'use client';

import React from 'react';
import {
  Settings, Building2, Globe, Package, Bell, Shield, type LucideProps,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SETTINGS_TABS, type SettingsTab } from './types';

interface Props {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

type LucideIcon = React.ComponentType<LucideProps>;

const ICON_MAP: Record<string, LucideIcon> = {
  Settings,
  Building2,
  Globe,
  Package,
  Bell,
  Shield,
};

export default function SettingsTabs({ activeTab, onChange }: Props) {
  const { t, isRTL } = useLanguage();

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav
        aria-label="Settings navigation"
        className={`hidden lg:flex flex-col w-56 shrink-0 gap-1 ${isRTL ? 'text-right' : ''}`}
      >
        {SETTINGS_TABS.map((tab) => {
          const Icon = ICON_MAP[tab.icon] ?? Settings;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isRTL ? 'flex-row-reverse' : '',
                isActive
                  ? 'bg-[#5B5FC7]/10 text-[#5B5FC7] border border-[#5B5FC7]/30'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent',
              ].join(' ')}
            >
              <Icon size={16} className={isActive ? 'text-[#5B5FC7]' : 'text-gray-400'} />
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile: horizontal scrollable tabs */}
      <div className="lg:hidden overflow-x-auto pb-1 -mx-4 px-4">
        <div className="flex gap-2 w-max">
          {SETTINGS_TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon] ?? Settings;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                  isActive
                    ? 'bg-[#5B5FC7]/10 text-[#5B5FC7] border-[#5B5FC7]/40'
                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50',
                ].join(' ')}
              >
                <Icon size={13} />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
