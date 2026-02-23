'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderTree,
  Layers,
  Package,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  Clock,
  AlertCircle,
  PieChart,
  ChevronDown,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDashboard } from '@/contexts/DashboardContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  /** Translation key — resolved at render time via t() */
  nameKey: string;
  icon: React.ElementType;
  href?: string;
  badge?: boolean;
  children?: { nameKey: string; href: string; icon: React.ElementType }[];
}

const adminMenuItems: MenuItem[] = [
  { nameKey: 'dashboard',     icon: LayoutDashboard, href: '/admin/dashboard' },
  { nameKey: 'categories',    icon: FolderTree,       href: '/admin/categories' },
  { nameKey: 'subcategories', icon: Layers,           href: '/admin/subcategories' },
  { nameKey: 'products',      icon: Package,          href: '/admin/products' },
  { nameKey: 'orders',        icon: ShoppingCart,     href: '/admin/orders' },
  { nameKey: 'users',         icon: Users,            href: '/admin/users' },
  {
    nameKey: 'quotations',
    icon: FileText,
    children: [
      { nameKey: 'allQuotations',    href: '/admin/quotations',         icon: FileText },
      { nameKey: 'createQuotation',  href: '/admin/quotations/create',  icon: PlusCircle },
      { nameKey: 'draftQuotations',  href: '/admin/quotations/drafts',  icon: Clock },
      { nameKey: 'expired',          href: '/admin/quotations/expired', icon: AlertCircle },
      { nameKey: 'quotationReports', href: '/admin/quotations/reports', icon: PieChart },
    ],
  },
  { nameKey: 'reports',       icon: BarChart3, href: '/admin/reports' },
  { nameKey: 'notifications', icon: Bell,      href: '/admin/notifications', badge: true },
  { nameKey: 'settings',      icon: Settings,  href: '/admin/settings' },
];

export const AdminSidebar = () => {
  const { sidebarCollapsed: collapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useDashboard();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(
    pathname.includes('/admin/quotations') ? ['quotations'] : []
  );

  const toggleExpanded = (nameKey: string) => {
    setExpandedMenus(prev =>
      prev.includes(nameKey) ? prev.filter(n => n !== nameKey) : [...prev, nameKey]
    );
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiService.get('/notifications/unread-count');
        if (response.data && typeof response.data.data === 'number') {
          setUnreadCount(response.data.data);
        }
      } catch {
        // silent fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0C1B33 0%, #112240 100%)' }}>
      {/* Logo Section */}
      <div className={cn('pt-7 pb-5 transition-all duration-300', collapsed ? 'px-3' : 'px-5')}>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className={cn('flex items-center gap-2.5 transition-all duration-300 overflow-hidden', collapsed ? 'w-0 opacity-0 invisible' : 'w-auto opacity-100 visible')}>
            {/* Shield icon */}
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M8 0L0 3.27273V9.27273C0 13.4545 3.42667 17.3636 8 18C12.5733 17.3636 16 13.4545 16 9.27273V3.27273L8 0Z" fill="white"/>
              </svg>
            </div>
            <div>
              <span className="text-white font-black text-lg tracking-[0.15em] leading-tight block">SHIELDER</span>
              <span className="text-[#FF6B35] text-[9px] font-bold uppercase tracking-[0.2em]">Admin Panel</span>
            </div>
          </div>

          {/* Collapsed logo */}
          {collapsed && (
            <div className="w-9 h-9 rounded-lg bg-[#FF6B35] flex items-center justify-center mx-auto">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M8 0L0 3.27273V9.27273C0 13.4545 3.42667 17.3636 8 18C12.5733 17.3636 16 13.4545 16 9.27273V3.27273L8 0Z" fill="white"/>
              </svg>
            </div>
          )}

          {/* Desktop toggle — flip chevron for RTL */}
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
              aria-label="Collapse sidebar"
            >
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex mt-4 mx-auto p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
            aria-label="Expand sidebar"
          >
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

        {!collapsed && <div className="mt-5 h-px w-full bg-white/10" />}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto scrollbar-hide py-2 space-y-0.5 transition-all duration-300', collapsed ? 'px-2' : 'px-3')}>
        {adminMenuItems.map(item => {
          const label = t(item.nameKey);

          // Group with children (e.g. Quotations)
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.nameKey);
            const isGroupActive = item.children.some(
              c => pathname === c.href || pathname.startsWith(c.href + '/')
            );
            return (
              <div key={item.nameKey}>
                <button
                  onClick={() => !collapsed && toggleExpanded(item.nameKey)}
                  className={cn(
                    'w-full flex items-center py-3 rounded-xl transition-all duration-200 group',
                    collapsed ? 'justify-center px-2' : 'px-3',
                    isGroupActive
                      ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                  title={collapsed ? label : ''}
                  aria-expanded={isExpanded}
                >
                  <item.icon size={19} className={cn('shrink-0', isGroupActive ? 'text-white' : 'text-white/60 group-hover:text-white')} />
                  <span className={cn(
                    'ms-3 text-sm font-semibold whitespace-nowrap flex-1 text-start transition-all duration-300',
                    collapsed ? 'opacity-0 invisible w-0 ms-0 overflow-hidden' : 'opacity-100 visible'
                  )}>
                    {label}
                  </span>
                  {!collapsed && (
                    <ChevronDown size={13} className={cn('text-white/40 transition-transform duration-300', isExpanded ? 'rotate-180' : '')} />
                  )}
                </button>
                {isExpanded && !collapsed && (
                  <div className={cn('ms-3 mt-0.5 space-y-0.5 ps-4', isRTL ? 'border-r border-white/10' : 'border-l border-white/10')}>
                    {item.children.map(child => {
                      const childLabel = t(child.nameKey);
                      const isActive = pathname === child.href || pathname.startsWith(child.href + '/');
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            'flex items-center py-2 px-3 rounded-lg text-xs transition-all duration-200',
                            isActive
                              ? 'bg-white/15 text-white font-semibold'
                              : 'text-white/50 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          <child.icon size={13} className="me-2.5 shrink-0" />
                          <span>{childLabel}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular item
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setIsMobileOpen(false)}
              prefetch={true}
              className={cn(
                'flex items-center py-3 rounded-xl transition-all duration-200 group relative',
                collapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
              title={collapsed ? label : ''}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                size={19}
                className={cn('shrink-0 transition-all', isActive ? 'text-white' : 'text-white/60 group-hover:text-white')}
              />
              <span className={cn(
                'ms-3 text-sm font-semibold whitespace-nowrap transition-all duration-300',
                collapsed ? 'opacity-0 invisible w-0 ms-0 overflow-hidden' : 'opacity-100 visible'
              )}>
                {label}
              </span>
              {/* Notification badge */}
              {item.badge && unreadCount > 0 && (
                <span className={cn(
                  'absolute bg-red-500 text-white text-[9px] font-black rounded-full transition-all duration-300',
                  collapsed ? 'top-1.5 end-1.5 w-2 h-2' : 'end-3 px-1.5 py-0.5 min-w-[18px] text-center'
                )}>
                  {collapsed ? '' : (unreadCount > 99 ? '99+' : unreadCount)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={cn('pb-6 border-t border-white/10 transition-all duration-300', collapsed ? 'px-2 pt-3' : 'px-3 pt-3')}>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center py-3 rounded-xl text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all group',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
          title={collapsed ? t('logout') : ''}
        >
          <LogOut size={19} className="shrink-0 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          <span className={cn('ms-3 text-sm font-semibold transition-all duration-300', collapsed ? 'opacity-0 invisible w-0 ms-0 overflow-hidden' : 'opacity-100 visible')}>
            {t('logout')}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — start-0 = left in LTR, right in RTL */}
      <aside
        className={cn(
          'hidden lg:flex fixed start-0 top-0 h-screen z-50 flex-col transition-all duration-300 shadow-2xl',
          collapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer — slides from start edge */}
      <div className={cn('lg:hidden fixed inset-0 z-[60] transition-all duration-300', isMobileOpen ? 'visible' : 'invisible')}>
        <div
          className={cn('absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300', isMobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setIsMobileOpen(false)}
        />
        <aside
          className={cn(
            'absolute start-0 top-0 h-full w-[240px] shadow-2xl transition-transform duration-300',
            isMobileOpen
              ? 'translate-x-0'
              : isRTL ? 'translate-x-full' : '-translate-x-full'
          )}
          style={{ background: 'linear-gradient(180deg, #0C1B33 0%, #112240 100%)' }}
        >
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-6 end-4 text-white/60 hover:text-white p-1.5"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
          {SidebarContent}
        </aside>
      </div>
    </>
  );
};
