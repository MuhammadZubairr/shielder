'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import settingsService from '@/services/settings.service';
import {
  FormSection, ToggleSwitch, SaveBar,
} from './FormComponents';
import type { NotificationFormState } from './types';

interface Props { settings: any; onSaved: () => void; }

const EMPTY: NotificationFormState = {
  enableEmailNotifications: true,
  enableLowStockAlerts: true,
  lowStockThreshold: 10,
  enableOrderStatusNotifications: true,
  enablePaymentNotifications: true,
};

export default function NotificationSettingsForm({ settings, onSaved }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<NotificationFormState>(EMPTY);
  const [orig, setOrig] = useState<NotificationFormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const v: NotificationFormState = {
      enableEmailNotifications: settings.enableEmailNotifications ?? true,
      enableLowStockAlerts: settings.enableLowStockAlerts ?? true,
      lowStockThreshold: settings.lowStockThreshold ?? 10,
      enableOrderStatusNotifications: settings.enableOrderStatusNotifications ?? true,
      enablePaymentNotifications: settings.enablePaymentNotifications ?? true,
    };
    setForm(v);
    setOrig(v);
  }, [settings]);

  const dirty = JSON.stringify(form) !== JSON.stringify(orig);

  const toggle = (k: keyof NotificationFormState) => (v: boolean) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSettings('notification', form);
      setOrig(form);
      toast.success(t('settingsSavedSuccess'));
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('settingsSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection title={t('settingsNotifChannels')} description={t('settingsNotifChannelsDesc')}>
        <ToggleSwitch
          checked={form.enableEmailNotifications}
          onChange={toggle('enableEmailNotifications')}
          label={t('settingsEnableEmail')}
          description={t('settingsEnableEmailDesc')}
        />
        <ToggleSwitch
          checked={true}
          onChange={() => {}}
          label={t('settingsEnableInApp')}
          description={t('settingsEnableInAppDesc')}
          disabled
        />
      </FormSection>

      <FormSection title={t('settingsNotifAlerts')} description={t('settingsNotifAlertsDesc')}>
        <ToggleSwitch
          checked={form.enableLowStockAlerts}
          onChange={toggle('enableLowStockAlerts')}
          label={t('settingsLowStockAlertToggle')}
          description={t('settingsLowStockAlertToggleDesc')}
        />
        <ToggleSwitch
          checked={form.enableOrderStatusNotifications}
          onChange={toggle('enableOrderStatusNotifications')}
          label={t('settingsOrderStatusAlerts')}
          description={t('settingsOrderStatusAlertsDesc')}
        />
        <ToggleSwitch
          checked={form.enablePaymentNotifications}
          onChange={toggle('enablePaymentNotifications')}
          label={t('settingsPaymentAlerts')}
          description={t('settingsPaymentAlertsDesc')}
        />
      </FormSection>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setForm(orig)}
      />
    </div>
  );
}
