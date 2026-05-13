import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { SiteSettingsProvider } from '@/components/SiteSettingsProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام إدارة المحتوى',
  description: 'نظام متكامل لإدارة المحتوى',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'ar';
  let messages = {};
  try {
    messages = (await import('../../messages/ar.json')).default;
  } catch { /* empty */ }
  const dir = 'rtl';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" id="favicon-link" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-text-main">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SiteSettingsProvider>
            {children}
          </SiteSettingsProvider>
          <Toaster position={dir === 'rtl' ? 'bottom-left' : 'bottom-right'} richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

