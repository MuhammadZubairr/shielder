'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useDashboard();
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 relative",
        sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
      )}>
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN">
      <DashboardProvider>
        <SuperAdminLayoutContent>
          {children}
        </SuperAdminLayoutContent>
      </DashboardProvider>
    </ProtectedRoute>
  );
}
