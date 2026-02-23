'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  ShoppingCart, 
  FileText, 
  Package, 
  UserPlus,
  X,
  ChevronDown,
  Globe
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { useAuth } from '@/hooks/useAuth';
import adminService from '@/services/admin.service';
import type { TranslationKey } from '@/i18n/config';

// Route → { titleKey, subtitleKey } — resolved via t() at render
type PageTitleKeys = { titleKey: TranslationKey; subtitleKey: TranslationKey };
const PAGE_TITLE_KEYS: Record<string, PageTitleKeys> = {
  '/admin/dashboard':         { titleKey: 'dashboard',     subtitleKey: 'overviewAnalytics' },
  '/admin/categories':        { titleKey: 'categories',    subtitleKey: 'manageCategories' },
  '/admin/subcategories':     { titleKey: 'subcategories', subtitleKey: 'manageSubcategories' },
  '/admin/products':          { titleKey: 'products',      subtitleKey: 'productInventory' },
  '/admin/orders':            { titleKey: 'orders',        subtitleKey: 'manageOrders' },
  '/admin/users':             { titleKey: 'users',         subtitleKey: 'customerAccounts' },
  '/admin/quotations':        { titleKey: 'quotations',    subtitleKey: 'manageQuotations' },
  '/admin/quotations/create': { titleKey: 'newQuotation',  subtitleKey: 'newQuotationSubtitle' },
  '/admin/reports':           { titleKey: 'reports',       subtitleKey: 'analyticsInsights' },
  '/admin/notifications':     { titleKey: 'notifications', subtitleKey: 'systemAlerts' },
  '/admin/settings':          { titleKey: 'settings',      subtitleKey: 'profilePassword' },
};

export const AdminNavbar = () => {
  const { setIsMobileOpen, toggleSidebar, sidebarCollapsed } = useDashboard();
  const { user } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  // Resolve translated page title for current route
  const getPageInfo = (path: string) => {
    const keys = PAGE_TITLE_KEYS[path]
      ?? PAGE_TITLE_KEYS[Object.keys(PAGE_TITLE_KEYS).find(k => path.startsWith(k + '/')) ?? ''];
    if (keys) return { title: t(keys.titleKey), subtitle: t(keys.subtitleKey) };
    const parts = path.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || 'dashboard';
    return { title: t(last as TranslationKey) || last, subtitle: t('adminPanel') };
  };

  const quickCreateItems = [
    { labelKey: 'newOrder',      icon: ShoppingCart, href: '/admin/orders/create' },
    { labelKey: 'newQuotation',  icon: FileText,     href: '/admin/quotations/create' },
    { labelKey: 'addProduct',    icon: Package,      href: '/admin/products' },
    { labelKey: 'addNew',        icon: UserPlus,     href: '/admin/users' },
  ];

  const pageInfo = getPageInfo(pathname);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Quick Create state
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  // Language switcher state
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target as Node)) {
        setShowQuickCreate(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [productsRes, usersRes, categoriesRes] = await Promise.allSettled([
          adminService.getProductsForManagement({ search: searchQuery, limit: 3 }),
          adminService.getAllUsers({ search: searchQuery, limit: 3 }),
          adminService.getCategories({ search: searchQuery, limit: 3 }),
        ]);
        const results: any[] = [];
        if (productsRes.status === 'fulfilled') {
          (productsRes.value?.data?.products || []).forEach((p: any) => 
            results.push({ type: 'Product', label: p.translations?.[0]?.name || p.name || 'Product', href: '/admin/products' })
          );
        }
        if (usersRes.status === 'fulfilled') {
          (usersRes.value?.data || []).forEach((u: any) =>
            results.push({ type: 'User', label: u.profile?.fullName || u.email, href: '/admin/users' })
          );
        }
        if (categoriesRes.status === 'fulfilled') {
          (categoriesRes.value?.data?.categories || categoriesRes.value?.data || []).forEach((c: any) =>
            results.push({ type: 'Category', label: c.name || c.translations?.[0]?.name, href: '/admin/categories' })
          );
        }
        setSearchResults(results.slice(0, 6));
        setShowSearchResults(true);
      } catch {
        // silent
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left: Toggle + Title */}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsMobileOpen(true);
            } else {
              toggleSidebar();
            }
          }}
          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:block">
          <h1 className="text-base font-black text-gray-900 leading-tight tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-[10px] font-semibold text-[#FF6B35] uppercase tracking-widest leading-tight">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowSearchResults(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
            {isSearching ? (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">{t('searching')}</div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { router.push(r.href); setShowSearchResults(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-start transition-colors"
                  >
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#FF6B35]/10 text-[#FF6B35] uppercase">{r.type}</span>
                    <span className="text-sm text-gray-700 font-medium truncate">{r.label}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">{t('noResultsFound')}</div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Quick Create */}
        <div className="relative" ref={quickCreateRef}>
          <button
            onClick={() => setShowQuickCreate(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-md shadow-[#FF6B35]/30"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown size={12} className={cn('transition-transform', showQuickCreate ? 'rotate-180' : '')} />
          </button>

          {showQuickCreate && (
            <div className="absolute end-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('quickActions')}</p>
              </div>
              {quickCreateItems.map(item => (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setShowQuickCreate(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-start"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                    <item.icon size={14} className="text-[#FF6B35]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{t(item.labelKey as TranslationKey)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl text-xs font-bold transition-all"
            title="Switch Language"
          >
            <Globe size={16} />
            <span className="hidden sm:inline uppercase tracking-wide">{locale}</span>
          </button>

          {showLangMenu && (
            <div className="absolute end-0 top-full mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('switchLanguage')}</p>
              </div>
              {[
                { code: 'en' as const, label: 'English', native: 'English', flag: '🇬🇧' },
                { code: 'ar' as const, label: 'Arabic',  native: 'العربية', flag: '🇸🇦' },
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLocale(lang.code); setShowLangMenu(false); }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-start',
                    locale === lang.code && 'bg-[#FF6B35]/5'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="text-sm font-semibold text-gray-700">{lang.native}</span>
                  </div>
                  {locale === lang.code && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-100 hidden sm:block mx-1" />

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
