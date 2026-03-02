/**
 * Dashboard Route Loading State
 * Shown immediately when navigating to /superadmin/dashboard,
 * replacing the blank white screen during JS chunk loading.
 */

import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-16 mt-3" />
          <div className="h-3 bg-gray-100 rounded w-32 mt-2" />
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-6">
      {/* Header skeleton */}
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
