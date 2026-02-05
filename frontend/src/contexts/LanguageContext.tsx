'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getTranslation, isRTL } from '@/utils/translations';
import { STORAGE_KEYS } from '@/utils/constants';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getTranslation>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved locale from localStorage
    const savedLocale = localStorage.getItem(STORAGE_KEYS.LOCALE) as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Update document direction and lang attribute
    const direction = isRTL(locale) ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const value = {
    locale,
    setLocale,
    t: getTranslation(locale),
    isRTL: isRTL(locale),
  };

  // Prevent flash of wrong direction
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
