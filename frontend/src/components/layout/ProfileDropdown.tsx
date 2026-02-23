'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Lock, 
  LogOut, 
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants';
import { getImageUrl } from '@/utils/helpers';

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      setIsOpen(false);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const getProfileLink = () => {
    if (user?.role === 'SUPER_ADMIN') return '/superadmin/profile';
    if (user?.role === 'ADMIN') return '/admin/profile';
    return '/profile';
  };

  const getChangePasswordLink = () => {
    if (user?.role === 'SUPER_ADMIN') return '/superadmin/profile?tab=security';
    if (user?.role === 'ADMIN') return '/admin/profile?tab=security';
    return '/profile/security';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 md:space-x-3 cursor-pointer group hover:bg-secondary/10 p-1 px-2 rounded-xl transition-all"
      >
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-sm font-bold text-tertiary line-clamp-1">
            {user?.profile?.fullName || 'Super Admin'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-primary font-bold tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
              {user?.role === 'SUPER_ADMIN' ? '(Super Admin)' : (user?.role ? `(${user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')})` : '')}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-dark flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
          {user?.profile?.profileImage ? (
            <img 
              src={getImageUrl(user.profile.profileImage) || ''} 
              alt="Profile" 
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 md:w-64 bg-white rounded-2xl shadow-2xl border border-secondary/10 z-50 overflow-hidden transform origin-top-right animate-in fade-in slide-in-from-top-1 fixed md:absolute left-4 right-4 md:left-auto md:right-0">
          {/* Header */}
          <div className="p-4 bg-secondary/5 border-b border-secondary/10">
            <p className="text-sm font-medium text-secondary">Logged in as</p>
            <p className="text-base font-bold text-tertiary truncate">{user?.email}</p>
            {user?.role === 'SUPER_ADMIN' && (
              <p className="text-[10px] text-primary font-bold mt-1">(Super Admin)</p>
            )}
          </div>

          {/* Links */}
          <div className="p-2">
            <Link 
              href={getProfileLink()} 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-xl text-secondary hover:bg-secondary/10 hover:text-primary transition-colors group"
            >
              <div className="p-2 bg-secondary/5 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <User size={18} />
              </div>
              <span className="font-semibold">Profile</span>
            </Link>

            <Link 
              href={getChangePasswordLink()} 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-xl text-secondary hover:bg-secondary/10 hover:text-primary transition-colors group"
            >
              <div className="p-2 bg-secondary/5 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <span className="font-semibold">Change Password</span>
            </Link>

            {user?.role === 'SUPER_ADMIN' && (
              <Link 
                href="/superadmin/settings" 
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl text-secondary hover:bg-secondary/10 hover:text-primary transition-colors group"
              >
                <div className="p-2 bg-secondary/5 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Settings size={18} />
                </div>
                <span className="font-semibold">Settings</span>
              </Link>
            )}
          </div>

          {/* Footer / Logout */}
          <div className="p-2 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex items-center space-x-3 w-full p-3 rounded-xl text-critical-500 hover:bg-critical-50 transition-colors group ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="p-2 bg-critical-100 rounded-lg group-hover:bg-critical-500 group-hover:text-white transition-colors text-critical-600">
                <LogOut size={18} />
              </div>
              <span className="font-bold">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
