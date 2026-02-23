/**
 * Navigation Progress Bar
 * Shows a progress indicator at the top during page transitions
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading
    setIsLoading(true);
    setProgress(10);

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(60), 100);
    const timer3 = setTimeout(() => setProgress(90), 200);
    
    // Complete loading
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-transparent z-[9999] pointer-events-none"
      style={{
        opacity: isLoading ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 shadow-lg shadow-blue-500/50"
        style={{
          width: `${progress}%`,
          transition: 'width 0.3s ease-out',
          transformOrigin: 'left',
        }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
      </div>
    </div>
  );
}
