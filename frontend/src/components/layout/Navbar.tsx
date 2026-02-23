'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { usePathname } from 'next/navigation';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { GlobalSearch } from './GlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import profileService from '@/services/profile.service';

export const Navbar = () => {
  const { setIsMobileOpen, toggleSidebar, sidebarCollapsed } = useDashboard();
  const { user } = useAuth();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Title Logic
  const getPageTitle = (path: string) => {
    if (path === '/superadmin' || path === '/admin' || path === '/dashboard') return 'Dashboard Overview';
    
    const parts = path.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    
    if (!lastPart) return 'Dashboard';
    
    // Formatting: users -> Users, order-details -> Order Details
    return lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Dark mode persistence
  useEffect(() => {
    // 1. Initial sync from localStorage (instant feedback)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // 2. Sync from user profile preference if available
    const dbTheme = (user?.profile?.preferences as any)?.theme;
    if (dbTheme) {
      const isDbDark = dbTheme === 'dark';
      setIsDarkMode(isDbDark);
      if (isDbDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [user]);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const theme = newMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    // Dispatch a custom event so ThemeClientWrapper updates immediately
    window.dispatchEvent(new Event('theme-toggle'));

    // Persist to DB if logged in
    if (user) {
      try {
        await profileService.updatePreferences({ theme });
      } catch (error) {
        console.error('Failed to sync theme preference:', error);
      }
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Toggle Button (Hamburger) */}
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsMobileOpen(true);
            } else {
              toggleSidebar();
            }
          }}
          className="p-2.5 text-gray-600 hover:bg-shielder-primary/10 hover:text-shielder-primary rounded-xl transition-all active:scale-90 shadow-sm md:shadow-none bg-white md:bg-transparent"
        >
          <Menu size={22} className={sidebarCollapsed ? "" : "rotate-90 transition-transform"} />
        </button>

        {/* Dynamic Page Title */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-[10px] font-bold text-shielder-primary uppercase tracking-[0.2em]">
            System Control Panel
          </p>
        </div>
      </div>

      {/* Global Search - Dynamic Responsive Behavior */}
      <div className="flex-1 max-w-xl mx-4 lg:mx-12">
        <GlobalSearch />
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-gray-600 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all group"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} className="group-hover:scale-110 transition-transform" />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Vertical Separator */}
        <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

