'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Shield, Calendar, Phone, Building2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-shielder-dark to-shielder-primary relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-shielder-dark relative">
                {user?.profile?.profileImage ? (
                  <Image src={user.profile.profileImage} alt="Profile" className="rounded-xl object-cover" fill />
                ) : (
                  <User size={40} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">{user?.profile?.fullName || 'Super Admin'}</h1>
              <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 bg-shielder-primary/10 text-shielder-primary text-xs font-bold rounded-full uppercase tracking-widest">
                {user?.role?.replace('_', ' ') || 'Full Access'}
              </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Account Info */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield size={20} className="text-shielder-primary" />
                Account Information
              </h2>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Mail className="text-gray-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Shield className="text-gray-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-shielder-primary" />
                Personal Details
              </h2>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Phone className="text-gray-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.profile?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Building2 className="text-gray-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.profile?.companyName || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
