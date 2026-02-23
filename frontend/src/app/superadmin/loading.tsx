/**
 * Loading State for Super Admin Pages
 * Shows immediately during navigation for smooth transitions
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-12 h-12 text-shielder-primary animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
    </div>
  );
}
