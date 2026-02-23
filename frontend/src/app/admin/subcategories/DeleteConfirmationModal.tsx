'use client';

import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import adminService from '@/services/admin.service';
import type { Subcategory } from './types';

interface Props {
  subcategory: Subcategory;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmationModal({
  subcategory,
  onClose,
  onSuccess,
}: Props) {
  const { t, isRTL, locale } = useLanguage();
  const [deleting, setDeleting] = React.useState(false);

  const displayName =
    locale === 'ar' && subcategory.nameAr ? subcategory.nameAr : subcategory.nameEn || subcategory.name;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await adminService.deleteSubcategory(subcategory.id);
      toast.success(t('subcategoryDeleted'));
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('subcategoryDeleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-t-4 border-red-500"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t('deleteSubcategory')}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('deleteSubcategoryWarning')}
          </p>

          {/* Subcategory badge */}
          <div className="mt-1 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl w-full">
            <p className="text-sm font-bold text-red-700 truncate">{displayName}</p>
            {subcategory._count?.products > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                {subcategory._count.products} {t('productsCount')}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-1">{t('deleteCannotUndo')}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          >
            {t('noCancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                <Trash2 size={16} />
                {t('yesDelete')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
