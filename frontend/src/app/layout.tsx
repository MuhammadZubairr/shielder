import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NavigationProgress } from '@/components/NavigationProgress';

const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Shielder - Industrial Filters Digital Platform',
  description: 'Enterprise digital backbone for industrial filters',
};



import { ThemeClientWrapper } from '@/components/layout/ThemeClientWrapper';
import { DirSync } from '@/components/DirSync';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${cairo.variable}`} suppressHydrationWarning>
        {/* Inline dir-sync script — sets [dir] + [lang] before React hydrates */}
        <DirSync />
        <NavigationProgress />
        <ThemeClientWrapper />
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
