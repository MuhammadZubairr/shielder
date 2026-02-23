'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import authService from '@/services/auth.service';
import { handleApiError } from '@/services/api.service';
import { toast } from 'react-hot-toast';

type TabType = 'profile' | 'security';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Password change
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: score, label: 'Fair', color: 'bg-yellow-500' };
    return { level: score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength(passwordData.newPassword);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-[#FF6B35]" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900">Account Settings</h1>
          <p className="text-xs text-gray-400">Manage your profile and security preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1">
        {[
          { key: 'profile' as TabType, label: 'Profile', icon: UserIcon },
          { key: 'security' as TabType, label: 'Security', icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#0C1B33] to-[#112240]">
            <h2 className="text-base font-black text-white">Profile Information</h2>
            <p className="text-xs text-white/60 mt-0.5">Your account details — read only</p>
          </div>
          <div className="p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] text-2xl font-black">
                {user?.profile?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-black text-gray-900 text-base">{user?.profile?.fullName || user?.email || 'Admin'}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-[10px] font-black uppercase tracking-widest">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                  {user?.profile?.fullName || '—'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                  {user?.email || '—'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Role</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Status</label>
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-black text-green-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Active
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                To update your profile information (name, phone, address), please contact your Super Admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#0C1B33] to-[#112240]">
            <h2 className="text-base font-black text-white">Change Password</h2>
            <p className="text-xs text-white/60 mt-0.5">Keep your account secure with a strong password</p>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">New Password *</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]"
                  placeholder="Minimum 8 characters"
                />
                <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-gray-200'} transition-all`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-black ${strength.level <= 2 ? 'text-red-500' : strength.level <= 3 ? 'text-yellow-500' : 'text-green-600'}`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full px-4 py-3 pr-11 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                      ? 'border-red-300 focus:ring-red-200'
                      : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                        ? 'border-green-300 focus:ring-green-200'
                        : 'border-gray-200 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]'
                  }`}
                  placeholder="Re-enter new password"
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                  <CheckCircle2 size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Password Requirements</p>
              <ul className="space-y-1">
                {[
                  { text: 'Minimum 8 characters', pass: passwordData.newPassword.length >= 8 },
                  { text: 'At least one uppercase letter', pass: /[A-Z]/.test(passwordData.newPassword) },
                  { text: 'At least one number', pass: /[0-9]/.test(passwordData.newPassword) },
                  { text: 'At least one special character', pass: /[^A-Za-z0-9]/.test(passwordData.newPassword) },
                ].map(({ text, pass }) => (
                  <li key={text} className={`flex items-center gap-2 text-xs font-medium ${pass ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${pass ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {pass && <CheckCircle2 size={8} className="text-white" />}
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="w-full py-3 bg-[#FF6B35] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#FF5722] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-[#FF6B35]/30"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
