'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, X, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import settingsService from '@/services/settings.service';
import {
  FormSection, FormRow, TextInput, SaveBar,
} from './FormComponents';
import type { CompanyFormState } from './types';

interface Props { settings: any; onSaved: () => void; }

const EMPTY: CompanyFormState = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  companyLogo: null,
};

const MAX_SIZE_MB = 2;

export default function CompanySettingsForm({ settings, onSaved }: Props) {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState<CompanyFormState>(EMPTY);
  const [orig, setOrig] = useState<CompanyFormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!settings) return;
    const v: CompanyFormState = {
      companyName: settings.companyName ?? '',
      companyEmail: settings.companyEmail ?? '',
      companyPhone: settings.companyPhone ?? '',
      companyAddress: settings.companyAddress ?? '',
      companyLogo: settings.companyLogo ?? null,
    };
    setForm(v);
    setOrig(v);
    setLogoPreview(settings.companyLogo ?? null);
  }, [settings]);

  const dirty = JSON.stringify(form) !== JSON.stringify(orig) || !!logoFile;

  const set = (k: keyof CompanyFormState) => (v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(t('settingsLogoSizeError').replace('{{mb}}', String(MAX_SIZE_MB)));
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('settingsLogoTypeError'));
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setForm((p) => ({ ...p, companyLogo: null }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = t('settingsErrorRequired');
    if (form.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)) {
      e.companyEmail = t('invalidEmail');
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Upload logo first if changed
      if (logoFile) {
        const res = await settingsService.uploadCompanyLogo(logoFile);
        const url = res.data?.data?.url ?? res.data?.url;
        if (url) setForm((p) => ({ ...p, companyLogo: url }));
      }
      await settingsService.updateSettings('general', {
        ...form,
        companyLogo: logoFile
          ? (logoPreview ?? form.companyLogo)
          : form.companyLogo,
      });
      setOrig(form);
      setLogoFile(null);
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
      {/* Logo */}
      <FormSection title={t('settingsCompanyLogo')} description={t('settingsCompanyLogoDesc')}>
        <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
            {logoPreview
              ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
              : <Building2 size={28} className="text-gray-300" />}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Upload size={13} />
              {t('settingsUploadLogo')}
            </button>
            {logoPreview && (
              <button
                type="button"
                onClick={removeLogo}
                className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <X size={12} />
                {t('settingsRemoveLogo')}
              </button>
            )}
            <p className="text-xs text-gray-400">{t('settingsLogoHint').replace('{{mb}}', String(MAX_SIZE_MB))}</p>
          </div>
        </div>
      </FormSection>

      {/* Company details */}
      <FormSection title={t('settingsCompanyDetails')} description={t('settingsCompanyDetailsDesc')}>
        <FormRow label={t('settingsCompanyName')} required error={errors.companyName}>
          <TextInput
            value={form.companyName}
            onChange={set('companyName')}
            placeholder={t('settingsCompanyNamePh')}
            error={!!errors.companyName}
          />
        </FormRow>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormRow label={t('settingsCompanyEmail')} error={errors.companyEmail}>
            <TextInput
              value={form.companyEmail}
              onChange={set('companyEmail')}
              type="email"
              placeholder="contact@company.com"
              error={!!errors.companyEmail}
              dir="ltr"
            />
          </FormRow>
          <FormRow label={t('settingsCompanyPhone')}>
            <TextInput
              value={form.companyPhone}
              onChange={set('companyPhone')}
              placeholder="+966 5x xxx xxxx"
              dir="ltr"
            />
          </FormRow>
        </div>

        <FormRow label={t('settingsCompanyAddress')}>
          <TextInput
            value={form.companyAddress}
            onChange={set('companyAddress')}
            placeholder={t('settingsCompanyAddressPh')}
          />
        </FormRow>
      </FormSection>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => { setForm(orig); setErrors({}); setLogoFile(null); setLogoPreview(orig.companyLogo); }}
      />
    </div>
  );
}
