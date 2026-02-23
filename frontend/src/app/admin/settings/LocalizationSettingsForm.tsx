'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  FormSection, FormRow, SelectInput, ToggleSwitch, SaveBar,
} from './FormComponents';
import {
  loadLocalizationPrefs, saveLocalizationPrefs,
  type LocalizationPrefs,
  DEFAULT_LOCALIZATION_PREFS,
} from './types';

interface Props { onSaved: () => void; }

const DIRECTION_OPTIONS = [
  { value: 'ltr', label: 'LTR (Left to Right)' },
  { value: 'rtl', label: 'RTL (Right to Left)' },
];
const NUMBER_FORMAT_OPTIONS = [
  { value: 'western', label: '1,234.56 (Western)' },
  { value: 'arabic',  label: '١٬٢٣٤٫٥٦ (Arabic-Indic)' },
];
const CURRENCY_POS_OPTIONS = [
  { value: 'before', label: 'SAR 100' },
  { value: 'after',  label: '100 SAR' },
];

export default function LocalizationSettingsForm({ onSaved }: Props) {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState<LocalizationPrefs>(DEFAULT_LOCALIZATION_PREFS);
  const [orig, setOrig] = useState<LocalizationPrefs>(DEFAULT_LOCALIZATION_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const prefs = loadLocalizationPrefs();
    setForm(prefs);
    setOrig(prefs);
  }, []);

  const dirty = JSON.stringify(form) !== JSON.stringify(orig);

  const set = <K extends keyof LocalizationPrefs>(k: K) => (v: LocalizationPrefs[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      saveLocalizationPrefs(form);
      setOrig(form);
      toast.success(t('settingsSavedSuccess'));
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection title={t('settingsLocaleLanguage')} description={t('settingsLocaleLanguageDesc')}>
        <ToggleSwitch
          checked={form.enableArabic}
          onChange={(v) => set('enableArabic')(v)}
          label={t('settingsEnableArabic')}
          description={t('settingsEnableArabicDesc')}
        />
        <FormRow label={t('settingsDefaultDirection')}>
          <SelectInput
            value={form.defaultDirection}
            onChange={(v) => set('defaultDirection')(v as 'ltr' | 'rtl')}
            options={DIRECTION_OPTIONS}
          />
        </FormRow>
      </FormSection>

      <FormSection title={t('settingsLocaleFormatting')} description={t('settingsLocaleFormattingDesc')}>
        <FormRow label={t('settingsNumberFormat')} hint={t('settingsNumberFormatHint')}>
          <SelectInput
            value={form.numberFormat}
            onChange={(v) => set('numberFormat')(v as 'western' | 'arabic')}
            options={NUMBER_FORMAT_OPTIONS}
          />
        </FormRow>
        <FormRow label={t('settingsCurrencyPosition')} hint={t('settingsCurrencyPositionHint')}>
          <SelectInput
            value={form.currencyPosition}
            onChange={(v) => set('currencyPosition')(v as 'before' | 'after')}
            options={CURRENCY_POS_OPTIONS}
          />
        </FormRow>
      </FormSection>

      <div className={`rounded-xl bg-[#5B5FC7]/[0.05] border border-[#5B5FC7]/15 px-4 py-3 text-xs text-[#5B5FC7] ${isRTL ? 'text-right' : ''}`}>
        {t('settingsLocaleStoredLocally')}
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setForm(orig)}
      />
    </div>
  );
}
