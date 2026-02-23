/**
 * Loading State for Admin Pages
 * Shows immediately during navigation for smooth transitions
 */

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#FF6B35]/20 border-t-[#FF6B35] animate-spin" />
      <p className="text-gray-400 text-sm font-bold animate-pulse tracking-wide">Loading...</p>
    </div>
  );
}
