'use client';

import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import adminService from '@/services/admin.service';
import type { Category } from './types';

interface Props {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmationModal({ category, onClose, onSuccess }: Props) {
  const { t, locale, isRTL } = useLanguage();
  const [deleting, setDeleting] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);

  // The display name based on selected language
  const displayName =
    (locale === 'ar' && category.nameAr) ? category.nameAr : (category.nameEn || category.name);

  const hasRelations =
    category._count.subcategories > 0 || category._count.products > 0;

  const handleDelete = async () => {
    if (hasRelations) {
      setBlocked(true);
      return;
    }
    try {
      setDeleting(true);
      await adminService.deleteCategory(category.id);
      toast.success(t('categoryDeleted'));
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('categoryDeleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  // ── Blocked state (has relations) ──────────────────────────────────────────
  if (blocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center border-b-8 border-yellow-400 animate-in zoom-in-95 duration-200"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-50 text-yellow-400 flex items-center justify-center mb-5">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-tight">
            {t('deletionBlocked')}
          </h2>
          <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 mb-6 text-start">
            <p className="text-gray-700 text-xs leading-relaxed mb-3">
              <b className="text-yellow-700">{displayName}</b> {t('contains')}:
            </p>
            <ul className="text-[11px] font-bold text-gray-500 space-y-1 ms-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                {category._count.subcategories} {t('subcategoriesCount')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                {category._count.products} {t('productsCount')}
              </li>
            </ul>
            <p className="text-gray-400 text-[10px] italic mt-3">{t('deletionBlockedMsg')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-black font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
          >
            {t('iUnderstand')}
          </button>
        </div>
      </div>
    );
  }

  // ── Normal delete confirmation ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center border-b-8 border-red-500 animate-in zoom-in-95 duration-200"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <Trash2 size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-tight">
          {t('deleteCategory')}?
        </h2>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-7">
          <p className="text-gray-600 text-xs leading-relaxed">
            {t('deleteWarningMsg')}{' '}
            <b className="text-red-600">{displayName}</b>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            {t('noCancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deleting && <Loader2 className="animate-spin" size={16} />}
            {t('yesDelete')}
          </button>
        </div>
      </div>
    </div>
  );
}
