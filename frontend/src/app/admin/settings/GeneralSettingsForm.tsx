'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import settingsService from '@/services/settings.service';
import {
  FormSection, FormRow, TextInput, SelectInput, SaveBar,
} from './FormComponents';
import {
  CURRENCY_OPTIONS, TIMEZONE_OPTIONS, DATE_FORMAT_OPTIONS, LANGUAGE_OPTIONS,
  type GeneralFormState,
} from './types';

interface Props { settings: any; onSaved: () => void; }

const EMPTY: GeneralFormState = {
  systemName: '',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
};

export default function GeneralSettingsForm({ settings, onSaved }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<GeneralFormState>(EMPTY);
  const [orig, setOrig] = useState<GeneralFormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<GeneralFormState>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const v: GeneralFormState = {
      systemName: settings.systemName ?? '',
      currency: settings.currency ?? 'SAR',
      timezone: settings.timezone ?? 'Asia/Riyadh',
      dateFormat: settings.dateFormat ?? 'DD/MM/YYYY',
      language: settings.language ?? 'en',
    };
    setForm(v);
    setOrig(v);
  }, [settings]);

  const dirty = JSON.stringify(form) !== JSON.stringify(orig);

  const set = <K extends keyof GeneralFormState>(k: K) => (v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<GeneralFormState> = {};
    if (!form.systemName.trim()) e.systemName = t('settingsErrorRequired');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await settingsService.updateSettings('general', form);
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
      <FormSection title={t('settingsGeneralSectionSystem')} description={t('settingsGeneralSectionSystemDesc')}>
        <FormRow label={t('settingsSystemName')} required error={errors.systemName}>
          <TextInput
            value={form.systemName}
            onChange={set('systemName')}
            placeholder={t('settingsSystemNamePh')}
            error={!!errors.systemName}
          />
        </FormRow>
      </FormSection>

      <FormSection title={t('settingsGeneralSectionRegional')} description={t('settingsGeneralSectionRegionalDesc')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormRow label={t('settingsCurrency')} required>
            <SelectInput
              value={form.currency}
              onChange={set('currency')}
              options={CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }))}
            />
          </FormRow>
          <FormRow label={t('settingsDefaultLanguage')}>
            <SelectInput
              value={form.language}
              onChange={set('language')}
              options={LANGUAGE_OPTIONS.map((l) => ({ value: l.value, label: t(l.labelKey) }))}
            />
          </FormRow>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormRow label={t('settingsTimezone')} required>
            <SelectInput
              value={form.timezone}
              onChange={set('timezone')}
              options={TIMEZONE_OPTIONS.map((z) => ({ value: z, label: z }))}
            />
          </FormRow>
          <FormRow label={t('settingsDateFormat')} required>
            <SelectInput
              value={form.dateFormat}
              onChange={set('dateFormat')}
              options={DATE_FORMAT_OPTIONS.map((f) => ({ value: f, label: f }))}
            />
          </FormRow>
        </div>
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
