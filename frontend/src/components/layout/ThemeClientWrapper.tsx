"use client";
import { useEffect } from 'react';

export function ThemeClientWrapper() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      applyTheme();
      window.addEventListener('storage', applyTheme);
      window.addEventListener('theme-toggle', applyTheme);
      return () => {
        window.removeEventListener('storage', applyTheme);
        window.removeEventListener('theme-toggle', applyTheme);
      };
    }
  }, []);
  return null;
}