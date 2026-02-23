'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import settingsService from '@/services/settings.service';
import {
  FormSection, FormRow, NumberInput, ToggleSwitch, SaveBar,
} from './FormComponents';
import type { InventoryFormState } from './types';

interface Props { settings: any; onSaved: () => void; }

const EMPTY: InventoryFormState = {
  lowStockThreshold: 10,
  enableLowStockAlerts: true,
  allowNegativeStock: false,
  autoUpdateStockOnCompletion: true,
};

const LS_KEY = 'shielder_admin_inventory_prefs';

function loadInventoryPrefs(): Pick<InventoryFormState, 'allowNegativeStock' | 'autoUpdateStockOnCompletion'> {
  if (typeof window === 'undefined') return { allowNegativeStock: false, autoUpdateStockOnCompletion: true };
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { allowNegativeStock: false, autoUpdateStockOnCompletion: true };
  } catch {
    return { allowNegativeStock: false, autoUpdateStockOnCompletion: true };
  }
}

export default function InventorySettingsForm({ settings, onSaved }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<InventoryFormState>(EMPTY);
  const [orig, setOrig] = useState<InventoryFormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const localPrefs = loadInventoryPrefs();
    const v: InventoryFormState = {
      lowStockThreshold: settings?.lowStockThreshold ?? 10,
      enableLowStockAlerts: settings?.enableLowStockAlerts ?? true,
      allowNegativeStock: localPrefs.allowNegativeStock,
      autoUpdateStockOnCompletion: localPrefs.autoUpdateStockOnCompletion,
    };
    setForm(v);
    setOrig(v);
  }, [settings]);

  const dirty = JSON.stringify(form) !== JSON.stringify(orig);

  const validate = () => {
    const e: Partial<Record<keyof InventoryFormState, string>> = {};
    if (form.lowStockThreshold < 0) e.lowStockThreshold = t('settingsErrorPositive');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Save server-side notification-linked fields
      await settingsService.updateSettings('notification', {
        enableEmailNotifications: settings?.enableEmailNotifications ?? true,
        enableLowStockAlerts: form.enableLowStockAlerts,
        lowStockThreshold: form.lowStockThreshold,
        enableOrderStatusNotifications: settings?.enableOrderStatusNotifications ?? true,
        enablePaymentNotifications: settings?.enablePaymentNotifications ?? true,
      });
      // Save local-only prefs
      localStorage.setItem(LS_KEY, JSON.stringify({
        allowNegativeStock: form.allowNegativeStock,
        autoUpdateStockOnCompletion: form.autoUpdateStockOnCompletion,
      }));
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
      <FormSection title={t('settingsInventoryStock')} description={t('settingsInventoryStockDesc')}>
        <FormRow
          label={t('settingsLowStockThreshold')}
          hint={t('settingsLowStockThresholdHint')}
          error={errors.lowStockThreshold}
        >
          <div className="max-w-[160px]">
            <NumberInput
              value={form.lowStockThreshold}
              onChange={(v) => setForm((p) => ({ ...p, lowStockThreshold: v }))}
              min={0}
              error={!!errors.lowStockThreshold}
            />
          </div>
        </FormRow>

        <ToggleSwitch
          checked={form.enableLowStockAlerts}
          onChange={(v) => setForm((p) => ({ ...p, enableLowStockAlerts: v }))}
          label={t('settingsEnableStockAlerts')}
          description={t('settingsEnableStockAlertsDesc')}
        />
      </FormSection>

      <FormSection title={t('settingsInventoryBehavior')} description={t('settingsInventoryBehaviorDesc')}>
        <ToggleSwitch
          checked={form.allowNegativeStock}
          onChange={(v) => setForm((p) => ({ ...p, allowNegativeStock: v }))}
          label={t('settingsAllowNegativeStock')}
          description={t('settingsAllowNegativeStockDesc')}
        />
        <ToggleSwitch
          checked={form.autoUpdateStockOnCompletion}
          onChange={(v) => setForm((p) => ({ ...p, autoUpdateStockOnCompletion: v }))}
          label={t('settingsAutoUpdateStock')}
          description={t('settingsAutoUpdateStockDesc')}
        />
      </FormSection>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => { setForm(orig); setErrors({}); }}
      />
    </div>
  );
}
