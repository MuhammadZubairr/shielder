'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-shielder-dark mb-4">
            Welcome, {user?.email}
          </h1>
          <p className="text-gray-600 mb-8">
            This is your customer dashboard. We are currently setting things up for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">My Orders</h3>
              <p className="text-blue-700 text-sm">View and track your previous orders.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2">Profile Settings</h3>
              <p className="text-green-700 text-sm">Update your personal information.</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-12 text-shielder-accent font-medium hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
