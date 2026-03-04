'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Settings, 
  ShoppingCart, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Database, 
  History,
  Save,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Upload,
  UploadCloud,
  ChevronRight,
  Lock
} from 'lucide-react';
import settingsService, { SystemSettings } from '@/services/settings.service';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/utils/helpers';
import { format } from 'date-fns';
import { ApiErrorResponse } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

type TabType = 'general' | 'order' | 'payment' | 'notification' | 'security' | 'backup' | 'logs';

export default function SettingsPage() {
    const { t, isRTL } = useLanguage();
    // Logo upload state and ref (for general tab)
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: OnChangeType) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingLogo(true);
      try {
        const { data } = await settingsService.uploadCompanyLogo(file);
        onChange('companyLogo', data.data.companyLogo);
        toast.success(t('settingLogoUpdated'));
      } catch (err) {
        toast.error(t('settingLogoFailed'));
      } finally {
        setUploadingLogo(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Form states
  const [formData, setFormData] = useState<SystemSettings | null>(null);

  useEffect(() => {
    fetchSettings();
    
    // Check for tab in URL
    if (typeof window !== 'undefined') {
       const params = new URLSearchParams(window.location.search);
       const tab = params.get('tab') as TabType;
       if (tab && ['general', 'order', 'payment', 'notification', 'security', 'backup', 'logs'].includes(tab)) {
         setActiveTab(tab);
       }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await settingsService.getSettings();
      // Normalize nulls so controlled inputs never get null values
      const raw = data.data || {};
      const normalized: SystemSettings = {
        ...raw,
        companyLogo: raw.companyLogo ?? null,
        companyEmail: raw.companyEmail ?? '',
        companyPhone: raw.companyPhone ?? '',
        companyAddress: raw.companyAddress ?? '',
        paymentMethodsEnabled: Array.isArray(raw.paymentMethodsEnabled) ? raw.paymentMethodsEnabled : [],
        paymentGatewayApiKey: raw.paymentGatewayApiKey ?? '',
        paymentGatewaySecretKey: raw.paymentGatewaySecretKey ?? '',
        paymentWebhookUrl: raw.paymentWebhookUrl ?? '',
        roleNotificationMappings: raw.roleNotificationMappings ?? null,
        autoCancelUnpaidOrdersHours: raw.autoCancelUnpaidOrdersHours ?? null,
        lastBackupDate: raw.lastBackupDate ?? null,
        autoBackupSchedule: raw.autoBackupSchedule ?? null,
      };
      setFormData(normalized);
    } catch (err) {
      toast.error(t('settingLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const { data } = await settingsService.getLogs({});
      setLogs(data.data.logs);
    } catch (err) {
      toast.error(t('settingLogsFailed'));
    } finally {
      setLogsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[] | null) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async (section: TabType) => {
    // Critical sections require password verification
    const criticalSections: TabType[] = ['payment', 'security', 'backup'];
    
    if (criticalSections.includes(section)) {
      setPendingAction(() => () => performSave(section));
      setShowConfirmModal(true);
      return;
    }

    performSave(section);
  };

  const performSave = async (section: TabType) => {
    setSaving(true);
    try {
      await settingsService.updateSettings(section, formData as SystemSettings);
      toast.success(t('settingsSaved'));
      fetchSettings(); // Refresh to get masked values/audit updates
    } catch (err) {
      const error = err as ApiErrorResponse;
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
      setVerifyPassword('');
    }
  };

  const handleVerifyAndProceed = async () => {
    if (!verifyPassword) return;
    setVerifying(true);
    try {
      await settingsService.verifyPassword(verifyPassword);
      if (pendingAction) {
        pendingAction();
      }
    } catch (err) {
      toast.error(t('settingPasswordInvalid'));
    } finally {
      setVerifying(false);
    }
  };

  const sidebarItems = [
    { id: 'general', label: t('settingTabGeneral'), icon: <Settings size={20} />, color: 'blue' },
    { id: 'order', label: t('settingTabOrder'), icon: <ShoppingCart size={20} />, color: 'emerald' },
    { id: 'payment', label: t('settingTabPayment'), icon: <CreditCard size={20} />, color: 'purple' },
    { id: 'notification', label: t('settingTabNotification'), icon: <Bell size={20} />, color: 'amber' },
    { id: 'security', label: t('settingTabSecurity'), icon: <ShieldCheck size={20} />, color: 'red' },
    { id: 'backup', label: t('settingTabBackup'), icon: <Database size={20} />, color: 'indigo' },
    { id: 'logs', label: t('settingTabLogs'), icon: <History size={20} />, color: 'gray' },
  ];

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shielder-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-4 sticky top-8">
            <div className="px-4 py-6 mb-4">
              <h1 className="text-2xl font-black text-shielder-dark uppercase tracking-tight">{t('configurationTitle')}</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t('systemControlPanel')}</p>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                    activeTab === item.id 
                      ? 'bg-shielder-primary text-white shadow-lg shadow-shielder-primary/20 scale-[1.02]' 
                      : 'text-gray-400 hover:text-shielder-dark hover:bg-gray-50'
                  }`}
                >
                  <span className={`${activeTab === item.id ? 'text-white' : `text-${item.color}-500`}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
              <h2 className="text-xl font-black text-shielder-dark uppercase tracking-tight">
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500 font-medium">{t('settingManageDesc')}</p>
            </div>

            <div className="p-8">
              {activeTab === 'general' && renderGeneralTab(formData, handleInputChange, uploadingLogo, fileInputRef, handleLogoUpload, t)}
              {activeTab === 'order' && renderOrderTab(formData, handleInputChange, t)}
              {activeTab === 'payment' && renderPaymentTab(formData, handleInputChange, t)}
              {activeTab === 'notification' && renderNotificationTab(formData, handleInputChange, t)}
              {activeTab === 'security' && renderSecurityTab(formData, handleInputChange, t)}
              {activeTab === 'backup' && renderBackupTab(formData, handleInputChange, () => setShowConfirmModal(true), () => setPendingAction(() => () => triggerBackup()), t)}
              {activeTab === 'logs' && renderLogsTab(logs, logsLoading, t)}

              {/* Save Changes button at the bottom */}
              {activeTab !== 'logs' && activeTab !== 'backup' && (
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => handleSave(activeTab)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#FF5722] transition-all shadow-md disabled:opacity-50"
                  >
                    {saving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                    {t('saveChanges')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-shielder-dark/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-black text-shielder-dark uppercase tracking-tight mb-2">{t('settingIdentityVerification')}</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">{t('settingIdentityVerificationDesc')}</p>
              
              <div className="space-y-4">
                <input 
                  type="password"
                  placeholder={t('settingAdminPassword')}
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary text-center font-bold tracking-widest"
                />
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => { setShowConfirmModal(false); setVerifyPassword(''); }}
                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-shielder-dark"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={handleVerifyAndProceed}
                    disabled={verifying || !verifyPassword}
                    className="flex-1 py-4 bg-[#FF6B35] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#FF6B35]/20 disabled:opacity-50"
                  >
                    {verifying ? t('settingVerifying') : t('settingAuthorizeAction')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function triggerBackup() {
    toast.promise(
      settingsService.triggerBackup(),
      {
        loading: t('settingBackupProgress'),
        success: t('settingBackupSuccess'),
        error: t('settingBackupFailed')
      }
    ).then(() => {
      fetchSettings();
      setShowConfirmModal(false);
      setVerifyPassword('');
    });
  }
}

// --------------------------------------------------------------------------------
// TAB RENDER FUNCTIONS
// --------------------------------------------------------------------------------

type OnChangeType = (f: string, v: string | number | boolean | string[] | null) => void;

function renderGeneralTab(
  data: SystemSettings,
  onChange: OnChangeType,
  uploadingLogo: boolean,
  fileInputRef: React.RefObject<HTMLInputElement>,
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>, onChange: OnChangeType) => void,
  t: (key: string) => string
) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingSystemName')}</label>
            <input 
              type="text" 
              value={data.systemName}
              onChange={(e) => onChange('systemName', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingCompanyName')}</label>
            <input 
              type="text" 
              value={data.companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingCompanyEmail')}</label>
            <input 
              type="email" 
              value={data.companyEmail}
              onChange={(e) => onChange('companyEmail', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingCompanyPhone')}</label>
            <input 
              type="text" 
              value={data.companyPhone}
              onChange={(e) => onChange('companyPhone', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-[32px] border border-dashed border-gray-200 text-center">
              <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-4 block">{t('settingCompanyLogo')}</label>
              <div className="w-24 h-24 bg-white rounded-2xl shadow-sm mx-auto mb-4 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                 {data.companyLogo ? (
                   <Image 
                     src={getImageUrl(data.companyLogo) || ''}
                     alt="Logo"
                     className="object-contain p-2"
                     fill
                   />
                 ) : (
                   <UploadCloud className="text-gray-300" size={32} />
                 )}
                 {uploadingLogo && (
                   <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-bold">{t('settingUploading')}</div>
                 )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => handleLogoUpload(e, onChange)}
              />
              <button
                type="button"
                className="text-[10px] font-black uppercase tracking-widest text-shielder-primary hover:underline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? t('settingUploading') : t('settingUploadNewFile')}
              </button>
          </div>
          <div>
            <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingPhysicalAddress')}</label>
            <textarea 
              rows={3}
              value={data.companyAddress}
              onChange={(e) => onChange('companyAddress', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold resize-none"
            />
          </div>
        </div>
      </div>

      {/* Currency / Timezone / Date Format — full width row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingCurrencyLabel')}</label>
          <select 
            value={data.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="SAR">SAR (ر.س)</option>
            <option value="PKR">PKR (Rs.)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingTimezoneLabel')}</label>
          <select 
            value={data.timezone}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
          >
            <option value="UTC">UTC (GMT+0)</option>
            <option value="America/New_York">Eastern Time (GMT-5)</option>
            <option value="America/Chicago">Central Time (GMT-6)</option>
            <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
            <option value="Europe/London">London (GMT+0)</option>
            <option value="Europe/Paris">Paris (GMT+1)</option>
            <option value="Asia/Dubai">Dubai (GMT+4)</option>
            <option value="Asia/Riyadh">Riyadh (GMT+3)</option>
            <option value="Asia/Karachi">Karachi (GMT+5)</option>
            <option value="Asia/Kolkata">India (GMT+5:30)</option>
            <option value="Asia/Shanghai">Shanghai (GMT+8)</option>
            <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingDateFormat')}</label>
          <select 
            value={data.dateFormat}
            onChange={(e) => onChange('dateFormat', e.target.value)}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function renderOrderTab(data: SystemSettings, onChange: OnChangeType, t: (key: string) => string) {
  return (
    <div className="space-y-8">
       <div>
          <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">{t('settingDefaultOrderStatus')}</label>
          <select
            value={data.defaultOrderStatus}
            onChange={(e) => onChange('defaultOrderStatus', e.target.value)}
            className="w-full md:w-64 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-[32px] hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={24} />
                </div>
                <button 
                  onClick={() => onChange('autoCompleteOrderAfterPayment', !data.autoCompleteOrderAfterPayment)}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.autoCompleteOrderAfterPayment ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data.autoCompleteOrderAfterPayment ? 'translate-x-6' : ''}`} />
                </button>
             </div>
             <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingAutoComplete')}</h4>
             <p className="text-[11px] text-gray-500 font-medium mt-1">{t('settingAutoCompleteDesc')}</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-[32px] hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-500">
                    <CreditCard size={24} />
                </div>
                <button 
                  onClick={() => onChange('allowPartialPayment', !data.allowPartialPayment)}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.allowPartialPayment ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data.allowPartialPayment ? 'translate-x-6' : ''}`} />
                </button>
             </div>
             <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingPartialPayments')}</h4>
             <p className="text-[11px] text-gray-500 font-medium mt-1">{t('settingPartialPaymentsDesc')}</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-[32px] hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500">
                    <ShieldAlert size={24} />
                </div>
                <button 
                  onClick={() => onChange('allowOrderCancellation', !data.allowOrderCancellation)}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.allowOrderCancellation ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data.allowOrderCancellation ? 'translate-x-6' : ''}`} />
                </button>
             </div>
             <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingCancellations')}</h4>
             <p className="text-[11px] text-gray-500 font-medium mt-1">{t('settingCancellationsDesc')}</p>
          </div>

          <div className="bg-gray-100/50 p-8 rounded-[32px] border border-gray-100">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                    <Clock size={24} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingZombieCleanup')}</h4>
                   <p className="text-[11px] text-gray-500 font-medium">{t('settingZombieCleanupDesc')}</p>
                </div>
             </div>
             <div className="relative mt-4">
                <input 
                  type="number" 
                  value={data.autoCancelUnpaidOrdersHours || ''}
                  onChange={(e) => onChange('autoCancelUnpaidOrdersHours', parseInt(e.target.value) || null)}
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-shielder-primary font-bold"
                  placeholder={t('settingDisabledLeaveEmpty')}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">{t('settingHours')}</span>
             </div>
          </div>
       </div>
    </div>
  );
}

function renderPaymentTab(data: SystemSettings, onChange: OnChangeType, t: (key: string) => string) {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
           <div>
              <h3 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingGatewayConfig')}</h3>
              <p className="text-[11px] text-gray-500 font-medium mt-1 text-red-500 font-bold uppercase tracking-widest">{t('settingEnterpriseSensitive')}</p>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl">
              <Lock size={14} className="text-amber-600" />
              <span className="text-[10px] font-black text-amber-600 uppercase">{t('settingEncryptedStorage')}</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-shielder-dark rounded-3xl p-6 text-white space-y-4">
             <div>
                <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">API KEY (PUBLIC)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={data.paymentGatewayApiKey || ''}
                    onChange={(e) => onChange('paymentGatewayApiKey', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-shielder-primary font-mono text-xs"
                  />
                </div>
             </div>
             <div>
                <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-2 block">SECRET KEY (PRIVATE)</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={data.paymentGatewaySecretKey || ''}
                    onChange={(e) => onChange('paymentGatewaySecretKey', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-shielder-primary font-mono text-xs"
                  />
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                <div>
                   <h4 className="text-xs font-black text-shielder-dark uppercase tracking-tight">{t('settingOnlinePayEnabled')}</h4>
                   <p className="text-[10px] text-gray-500 font-medium">{t('settingOnlinePayDesc')}</p>
                </div>
                <button 
                  onClick={() => onChange('onlinePaymentEnabled', !data.onlinePaymentEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.onlinePaymentEnabled ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data.onlinePaymentEnabled ? 'translate-x-6' : ''}`} />
                </button>
             </div>
             <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                <div>
                   <h4 className="text-xs font-black text-shielder-dark uppercase tracking-tight">{t('settingProductionMode')}</h4>
                   <p className="text-[10px] text-gray-500 font-medium">{t('settingProductionModeDesc')}</p>
                </div>
                <button 
                  onClick={() => onChange('paymentTestMode', !data.paymentTestMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${!data.paymentTestMode ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${!data.paymentTestMode ? 'translate-x-6' : ''}`} />
                </button>
             </div>
             <div className="bg-gray-50 p-6 rounded-3xl">
                <h4 className="text-xs font-black text-shielder-dark uppercase tracking-tight mb-2">{t('settingWebhookEndpoint')}</h4>
                <div className="flex gap-2">
                   <code className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-100 text-[10px] font-mono text-gray-400 break-all select-all">
                      {process.env.NEXT_PUBLIC_API_URL || 'https://api.shielder-filters.com'}/settings/payments/webhook
                   </code>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 p-8 rounded-[32px]">
          <h3 className="text-sm font-black text-shielder-dark uppercase tracking-tight mb-6">{t('settingDisbursementMethods')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'ONLINE_GATEWAY'].map(method => (
               <label key={method} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${data.paymentMethodsEnabled?.includes(method) ? 'bg-white border-shielder-primary shadow-sm' : 'bg-gray-100/50 border-gray-100'}`}>
                  <input 
                    type="checkbox"
                    checked={data.paymentMethodsEnabled?.includes(method)}
                    onChange={(e) => {
                      const current = data.paymentMethodsEnabled || [];
                      const next = e.target.checked 
                        ? [...current, method]
                        : current.filter((m: string) => m !== method);
                      onChange('paymentMethodsEnabled', next);
                    }}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${data.paymentMethodsEnabled?.includes(method) ? 'border-shielder-primary bg-shielder-primary' : 'border-gray-300'}`}>
                    {data.paymentMethodsEnabled?.includes(method) && <Save size={10} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-shielder-dark">{method.replace('_', ' ')}</span>
               </label>
             ))}
          </div>
      </section>
    </div>
  );
}

function renderNotificationTab(data: SystemSettings, onChange: OnChangeType, t: (key: string) => string) {
  const toggles = [
    { key: 'enableEmailNotifications' as keyof SystemSettings, labelKey: 'settingEmailBroadcasts', descKey: 'settingEmailBroadcastsDesc' },
    { key: 'enableLowStockAlerts' as keyof SystemSettings, labelKey: 'settingInventoryGuardLabel', descKey: 'settingInventoryGuardDesc' },
    { key: 'enableOrderStatusNotifications' as keyof SystemSettings, labelKey: 'settingOrderLifecycleLabel', descKey: 'settingOrderLifecycleDesc' },
    { key: 'enablePaymentNotifications' as keyof SystemSettings, labelKey: 'settingFinancialAudit', descKey: 'settingFinancialAuditDesc' },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toggles.map(toggle => (
          <div key={toggle.key} className="bg-gray-50 p-6 rounded-[32px] flex items-center justify-between hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
            <div className="flex-1">
              <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t(toggle.labelKey)}</h4>
              <p className="text-[11px] text-gray-500 font-medium mt-1">{t(toggle.descKey)}</p>
            </div>
            <button 
              onClick={() => onChange(toggle.key, !data[toggle.key])}
              className={`w-12 h-6 rounded-full transition-all relative ${data[toggle.key] ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data[toggle.key] ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-shielder-dark rounded-[40px] p-8 text-white">
          <div className="flex items-center gap-6">
             <div className="shrink-0 w-20 h-20 bg-shielder-primary/20 text-shielder-primary rounded-3xl flex items-center justify-center">
                <AlertTriangle size={36} />
             </div>
             <div>
                <h4 className="text-lg font-black uppercase tracking-tight">{t('settingStockBreach')}</h4>
                <p className="text-sm text-gray-400 mt-1">{t('settingStockBreachDesc')}</p>
                <div className="mt-6 flex items-center gap-4">
                   <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={data.lowStockThreshold} 
                      onChange={(e) => onChange('lowStockThreshold', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-shielder-primary"
                   />
                   <span className="w-16 text-center py-2 bg-white/10 rounded-xl font-black text-xl text-shielder-primary border border-white/10">
                      {data.lowStockThreshold}
                   </span>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}

function renderSecurityTab(data: SystemSettings, onChange: OnChangeType, t: (key: string) => string) {
  return (
    <div className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
             <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-4 block">{t('settingPasswordComplexity')}</label>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{t('settingMinLength')}</span>
                <span className="text-sm font-black text-shielder-dark">{data.passwordMinLength} {t('settingChars')}</span>
             </div>
             <input 
               type="range" min="8" max="32" 
               value={data.passwordMinLength}
               onChange={(e) => onChange('passwordMinLength', parseInt(e.target.value))}
               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-shielder-primary"
             />
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
             <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-4 block">{t('settingLoginHardening')}</label>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{t('settingMaxFailedRetries')}</span>
                <span className="text-sm font-black text-shielder-dark">{data.maxLoginAttempts} {t('settingAttempts')}</span>
             </div>
             <input 
               type="range" min="3" max="20" 
               value={data.maxLoginAttempts}
               onChange={(e) => onChange('maxLoginAttempts', parseInt(e.target.value))}
               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-shielder-primary"
             />
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
             <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-4 block">{t('settingSessionMgmt')}</label>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{t('settingTimeoutMins')}</span>
                <span className="text-sm font-black text-shielder-dark">{data.sessionTimeoutMinutes} {t('settingMinUnit')}</span>
             </div>
             <input 
               type="range" min="5" max="480" 
               value={data.sessionTimeoutMinutes}
               onChange={(e) => onChange('sessionTimeoutMinutes', parseInt(e.target.value))}
               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-shielder-primary"
             />
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
             <label className="text-[10px] font-black text-shielder-primary uppercase tracking-widest mb-4 block">{t('settingAccountLock')}</label>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{t('settingLockTimeMins')}</span>
                <span className="text-sm font-black text-shielder-dark">{data.accountLockDurationMinutes} {t('settingMinUnit')}</span>
             </div>
             <input 
               type="range" min="1" max="60" 
               value={data.accountLockDurationMinutes}
               onChange={(e) => onChange('accountLockDurationMinutes', parseInt(e.target.value))}
               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-shielder-primary"
             />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100 flex items-center justify-between">
             <div className="flex gap-4">
                <ShieldAlert className="text-red-600" size={24} />
                <div>
                   <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingForceStrongPw')}</h4>
                   <p className="text-[10px] text-gray-500 font-medium">{t('settingForceStrongPwDesc')}</p>
                </div>
             </div>
             <button 
                onClick={() => onChange('forceStrongPasswords', !data.forceStrongPasswords)}
                className={`w-12 h-6 rounded-full transition-all relative ${data.forceStrongPasswords ? 'bg-red-600 shadow-lg shadow-red-200' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data.forceStrongPasswords ? 'translate-x-6' : ''}`} />
              </button>
          </div>

          <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100 flex items-center justify-between">
             <div className="flex gap-4">
                <Lock className="text-purple-600" size={24} />
                <div>
                   <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight">{t('settingTwoFactor')}</h4>
                   <p className="text-[10px] text-gray-500 font-medium">{t('settingTwoFactorDesc')}</p>
                </div>
             </div>
             <button 
                onClick={() => onChange('enableTwoFactorAuth', !data.enableTwoFactorAuth)}
                className={`w-12 h-6 rounded-full transition-all relative ${data.enableTwoFactorAuth ? 'bg-purple-600 shadow-lg shadow-purple-200' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all transform ${data.enableTwoFactorAuth ? 'translate-x-6' : ''}`} />
              </button>
          </div>
       </div>
    </div>
  );
}

function renderBackupTab(data: SystemSettings, onChange: OnChangeType, onVerify: () => void, onProceed: () => void, t: (key: string) => string) {
  return (
    <div className="space-y-12">
      <div className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Database size={120} />
         </div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{t('settingManualSnapshot')}</h3>
            <p className="text-indigo-100 text-sm max-w-md">{t('settingManualSnapshotDesc')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
               <button 
                  onClick={() => { onVerify(); onProceed(); }}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
               >
                  <UploadCloud size={18} />
                  {t('settingInitiateBackup')}
               </button>
               <div className="flex items-center gap-3 px-6 py-4 bg-indigo-500/30 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="text-left">
                     <p className="text-[10px] font-black uppercase text-indigo-200">{t('settingLastSync')}</p>
                     <p className="text-xs font-bold">{data.lastBackupDate ? format(new Date(data.lastBackupDate), 'MMM dd, yyyy HH:mm') : t('settingNever')}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-gray-50 p-8 rounded-[36px] border border-gray-100">
            <h4 className="text-sm font-black text-shielder-dark uppercase tracking-tight mb-6">{t('settingAutomationSchedule')}</h4>
            <div className="space-y-4">
               {[
                 { key: 'nightly', label: t('settingEveryNight') },
                 { key: 'weekly', label: t('settingWeeklySunday') },
                 { key: 'never', label: t('settingNeverManual') }
               ].map(schedule => (
                 <label key={schedule.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-indigo-400 transition-all group">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-shielder-dark">{schedule.label}</span>
                    <input type="radio" name="schedule" className="accent-indigo-600 w-4 h-4" defaultChecked={schedule.key === 'never'} />
                 </label>
               ))}
            </div>
         </div>

         <div className="bg-red-50/30 p-8 rounded-[36px] border border-red-100 border-dashed">
            <h4 className="text-sm font-black text-red-600 uppercase tracking-tight mb-2">{t('settingCriticalRecovery')}</h4>
            <p className="text-[11px] text-gray-500 font-medium mb-6">{t('settingCriticalRecoveryDesc')}</p>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100">
               <Upload size={18} />
               {t('settingUploadRestore')}
            </button>
         </div>
      </div>
    </div>
  );
}

interface SystemLog {
  id: string;
  user?: {
    profile?: {
      fullName?: string;
    };
  };
  ipAddress?: string;
  action: string;
  changes?: {
    field: string;
    old: string | number | boolean | null;
    new: string | number | boolean | null;
  };
  createdAt: string;
}

function renderLogsTab(logs: SystemLog[], loading: boolean, t: (key: string) => string) {
  if (loading) return <div className="text-center py-20 animate-pulse font-black text-gray-300 uppercase italic">{t('settingParsingRecords')}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settingAdminCol')}</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settingActionCol')}</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settingFieldCol')}</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settingModificationCol')}</th>
            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settingTimestampCol')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-shielder-primary/10 text-shielder-primary rounded-lg flex items-center justify-center font-black text-[10px]">
                    {log.user?.profile?.fullName?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-shielder-dark uppercase tracking-tight">{log.user?.profile?.fullName || 'Admin'}</p>
                    <p className="text-[10px] text-gray-400">{log.ipAddress}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-[10px] font-black px-2 py-1 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">
                  {log.action.replace('UPDATE_SETTING_', '')}
                </span>
              </td>
              <td className="px-6 py-5 text-xs font-bold text-gray-600">{log.changes?.field}</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-[10px]">
                   <span className="text-red-400 line-through">{String(log.changes?.old)}</span>
                   <ChevronRight size={10} className="text-gray-300" />
                   <span className="text-emerald-500 font-bold">{String(log.changes?.new)}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <p className="text-[10px] font-black text-gray-400 uppercase">{format(new Date(log.createdAt), 'MMM dd, HH:mm')}</p>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="py-20 text-center text-xs font-black text-gray-300 uppercase">{t('settingNoAuditEvents')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
