'use client';

/**
 * SessionTimeoutWatcher
 * Reads `sessionTimeoutMinutes` from system settings and automatically
 * logs the user out after that many minutes of inactivity.
 *
 * Resets the countdown on any mouse/keyboard/touch/scroll activity.
 * Admin/SuperAdmin sessions use the configured value; the watcher is
 * dormant when nobody is logged in.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import settingsService from '@/services/settings.service';
import toast from 'react-hot-toast';

const DEFAULT_TIMEOUT_MS = 60 * 60 * 1000; // 60 min fallback
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export default function SessionTimeoutWatcher() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutMsRef = useRef<number>(DEFAULT_TIMEOUT_MS);

  useEffect(() => {
    if (!isAuthenticated) return;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        toast.error('Session expired. Please log in again.', { duration: 3000 });
        await logout();
        router.replace('/login');
      }, timeoutMsRef.current);
    }

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    if (isAdmin) {
      // Fetch configured session timeout from settings (admin/superadmin only)
      settingsService.getSettings()
        .then((res: any) => {
          const mins: number = res?.data?.data?.sessionTimeoutMinutes
            ?? res?.data?.sessionTimeoutMinutes
            ?? 60;
          timeoutMsRef.current = Math.max(5, mins) * 60 * 1000;
          resetTimer();
        })
        .catch(() => resetTimer());
    } else {
      // Customers use the default timeout — do not call /api/settings (requires admin)
      resetTimer();
    }

    // Attach activity listeners to reset the countdown
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [isAuthenticated]); // re-run when auth state changes

  return null; // purely behavioural component
}
