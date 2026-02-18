'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/utils/constants';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else {
        // Redirect based on role
        if (user?.role === 'SUPER_ADMIN') {
          router.push(ROUTES.SUPER_ADMIN_DASHBOARD);
        } else if (user?.role === 'ADMIN') {
          router.push(ROUTES.ADMIN_DASHBOARD);
        } else {
          router.push(ROUTES.CUSTOMER_DASHBOARD);
        }
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-shielder-dark">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-shielder-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

