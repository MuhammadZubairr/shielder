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

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    await logout();
  };

  const getProfileLink = () => {
    if (user?.role === 'SUPER_ADMIN') return '/superadmin/profile';
    if (user?.role === 'ADMIN') return '/admin/profile';
    return '/profile';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 md:space-x-3 cursor-pointer group hover:bg-gray-100 p-1 px-2 rounded-xl transition-all"
      >
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-sm font-bold text-gray-800 line-clamp-1">
            {user?.profile?.fullName || 'Super Admin'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-shielder-primary font-bold uppercase tracking-wider bg-shielder-primary/10 px-1.5 py-0.5 rounded">
              {user?.role?.replace('_', ' ') || 'Full Access'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-shielder-dark flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
          {user?.profile?.profileImage ? (
            <img 
              src={user.profile.profileImage} 
              alt="Profile" 
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-500">Logged in as</p>
            <p className="text-base font-bold text-gray-900 truncate">{user?.email}</p>
          </div>

          {/* Links */}
          <div className="p-2">
            <Link 
              href={getProfileLink()} 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-shielder-primary transition-colors group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-shielder-primary/10 group-hover:text-shielder-primary transition-colors">
                <User size={18} />
              </div>
              <span className="font-semibold">Profile</span>
            </Link>

            <Link 
              href="/profile/security" 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-shielder-primary transition-colors group"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-shielder-primary/10 group-hover:text-shielder-primary transition-colors">
                <Lock size={18} />
              </div>
              <span className="font-semibold">Security</span>
            </Link>

            {user?.role === 'SUPER_ADMIN' && (
              <Link 
                href="/superadmin/settings" 
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-shielder-primary transition-colors group"
              >
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-shielder-primary/10 group-hover:text-shielder-primary transition-colors">
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
              className="flex items-center space-x-3 w-full p-3 rounded-xl text-critical-500 hover:bg-critical-50 transition-colors group"
            >
              <div className="p-2 bg-critical-100 rounded-lg group-hover:bg-critical-500 group-hover:text-white transition-colors text-critical-600">
                <LogOut size={18} />
              </div>
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
